const express = require('express');
const mongoose = require('mongoose')
var bodyParser = require('body-parser')
const multer = require('multer');
const path = require('path');
const session = require('express-session');
const app = express();

const Posts = require('./Posts.js');

// Configuração do multer para upload de imagens
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({ storage: storage });

// Configuração da sessão
app.use(session({
    secret: 'sua_chave_secreta_aqui',
    resave: false,
    saveUninitialized: true
}));

// Middleware para verificar autenticação
const checkAuth = (req, res, next) => {
    if (req.session.logado) {
        next();
    } else {
        res.redirect('/admin/login');
    }
};

mongoose.connect('sua_conexao_mongodb',{useNewUrlParser: true, useUnifiedTopology: true}).then(function(){
    console.log('Conectado com sucesso');
}).catch(function(err){
    console.log(err.message);
})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use('/public', express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, '/pages'));

// Rotas do painel administrativo
app.get('/admin/login', (req, res) => {
    res.render('admin/login');
});

app.post('/admin/login', (req, res) => {
    const { usuario, senha } = req.body;
    // Aqui você deve implementar uma verificação mais segura
    if (usuario === 'admin' && senha === 'admin123') {
        req.session.logado = true;
        res.redirect('/admin');
    } else {
        res.redirect('/admin/login');
    }
});

app.get('/admin/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login');
});

app.get('/admin', checkAuth, (req, res) => {
    Posts.find({}).sort({'_id': -1}).exec(function(err, posts) {
        res.render('admin/painel', { posts: posts });
    });
});

app.post('/admin/post/novo', checkAuth, upload.single('imagem'), (req, res) => {
    const post = new Posts({
        titulo: req.body.titulo,
        conteudo: req.body.conteudo,
        categoria: req.body.categoria,
        autor: req.body.autor,
        imagem: req.file ? '/public/uploads/' + req.file.filename : '',
        slug: req.body.titulo.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-')
    });

    post.save().then(() => {
        res.redirect('/admin');
    }).catch(err => {
        console.log(err);
        res.redirect('/admin');
    });
});

app.delete('/admin/post/deletar/:id', checkAuth, (req, res) => {
    Posts.findByIdAndDelete(req.params.id).then(() => {
        res.status(200).send();
    }).catch(err => {
        res.status(500).send();
    });
});

// Rota para carregar a página de edição
app.get('/admin/editar/:id', checkAuth, (req, res) => {
    Posts.findById(req.params.id).then(post => {
        res.render('admin/editar', { post: post });
    }).catch(err => {
        console.log(err);
        res.redirect('/admin');
    });
});

// Rota para salvar as alterações
app.post('/admin/post/editar/:id', checkAuth, upload.single('imagem'), (req, res) => {
    const dadosAtualizados = {
        titulo: req.body.titulo,
        conteudo: req.body.conteudo,
        categoria: req.body.categoria,
        autor: req.body.autor,
        slug: req.body.titulo.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-')
    };

    // Se uma nova imagem foi enviada, atualiza o caminho
    if (req.file) {
        dadosAtualizados.imagem = '/public/uploads/' + req.file.filename;
    }

    Posts.findByIdAndUpdate(req.params.id, dadosAtualizados, { new: true })
        .then(() => {
            res.redirect('/admin');
        })
        .catch(err => {
            console.log(err);
            res.redirect('/admin');
        });
});

app.get('/',(req,res)=>{
    
    if(req.query.busca == null){
        Posts.find({}).sort({'_id': -1}).exec(function(err,posts){
            posts = posts.map(function(val){
                return{
                    titulo: val.titulo,
                    conteudo: val.conteudo,
                    descricaoCurta: val.conteudo.substring(0,600),
                    imagem: val.imagem,
                    slug: val.slug,
                    categoria: val.categoria
                }
            });

            Posts.find({}).sort({'views': -1}).limit(3).exec(function(err,postsTop){
                postsTop = postsTop.map(function(val){
                    return {
                        titulo: val.titulo,
                        conteudo: val.conteudo,
                        descricaoCurta: val.conteudo.substring(0,100),
                        imagem: val.imagem,
                        slug: val.slug,
                        categoria: val.categoria,
                        views: val.views
                    }

                })
                res.render('home',{posts:posts,postsTop:postsTop});
             })
        })
    }else{

        Posts.find({titulo: {$regex: req.query.busca, $options:"i"}}, function(err,posts){
            posts = posts.map(function(val){
                return{
                    titulo: val.titulo,
                    conteudo: val.conteudo,
                    descricaoCurta: val.conteudo.substring(0,100),
                    imagem: val.imagem,
                    slug: val.slug,
                    categoria: val.categoria
                }
            })
            res.render('busca', {posts:posts, contagem:posts.lenght});
        })

    }

  
});


app.get('/:slug',(req,res)=>{
    //res.send(req.params.slug);
    Posts.findOneAndUpdate({slug: req.params.slug}, {$inc:{views:1}}, {new:true}, function(err,resposta){
        //console.log(resposta);
        if(resposta != null){
            Posts.find({}).sort({'views': -1}).limit(3).exec(function(err, postsTop){
                postsTop = postsTop.map(function(val){
                    return {
                        titulo: val.titulo,
                        conteudo: val.conteudo,
                        descricaoCurta: val.conteudo.substring(0,100),
                        imagem: val.imagem,
                        slug: val.slug,
                        categoria: val.categoria,
                        views: val.views
                    }

                })

                res.render('single', {noticia:resposta, postsTop:postsTop});
            })
        }else{
            res.redirect('/');
        }

        
    })
})



app.listen(5000,()=>{
    console.log('server rodando!');
})