# Portal de Notícias Tech

Um portal de notícias dinâmico focado em tecnologia, desenvolvido com Node.js e MongoDB.

Link do site rodando: http://node63.lunes.host:3068

## 💻 Tecnologias

- Node.js
- Express
- MongoDB
- EJS
- Multer (para upload de imagens)

## 🚀 Funcionalidades

- Sistema de postagens dinâmicas
- Painel administrativo
- Upload de imagens
- Sistema de visualizações
- Categorias de tecnologia
- Busca integrada
- Design responsivo

## ⚙️ Como usar

1. Clone o repositório
```bash
git clone https://github.com/LuizRullesz/TechNews.git
cd portal-noticias
```

2. Instale as dependências
```bash
npm install
```

3. Inicie o servidor
```bash
node index.js
```

## 📱 Acessando

- **Site**: http://localhost:5000
- **Painel Admin**: http://localhost:5000/admin/login

## 👨‍💻 Painel Administrativo

Para acessar o painel admin:
1. Acesse /admin/login
2. Use as credenciais configuradas no .env
3. Gerencie suas postagens

## 📂 Estrutura

```
portal-noticias/
├── public/
│   ├── style.css
│   └── uploads/
├── pages/
│   ├── admin/
│   ├── partials/
│   ├── home.html
│   └── single.html
├── index.js
└── Posts.js
```

## 🔒 Segurança

- Configure corretamente o arquivo .env
- Nunca compartilhe suas credenciais
- Mantenha o Node.js e dependências atualizadas

## 📄 Licença

Este projeto está sob a licença MIT.

---
Desenvolvido por [Seu Nome] 
