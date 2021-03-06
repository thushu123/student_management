const express = require('express');
const app = new express();
const { userData } = require('./config/connection')
const bcrypt = require('bcrypt')
const session = require('express-session')
const {mystore} = require('./config/authentication')

app.use(session({
    secret:"My Secret Key",
    resave:false,
    saveUninitialized:false,
    store:mystore
}))
app.use(express.static('./public'))
app.set('view engine', 'ejs');
app.set('views', './src/views')
app.get('/', (req, res) => {
    res.render('index')
})
app.get('/home', (req, res) => {
    res.render('home')
})
//middleware FOR POST METHOD to get datas from body.
app.use(express.urlencoded({ extended: true }))
//in some cases
app.use(express.json())
const UsersRouter = require('./src/routes/usersroute');
app.use('/users', UsersRouter);
const StudentRouter = require('./src/routes/studentsroute');
app.use('/students', StudentRouter);

app.get('/signup', (req, res) => {
    res.render('signup');
})
app.post('/signup', async (req, res) => {
    console.log('req',req.body);
    const hashed_password=  await bcrypt.hash(req.body.password,10)
    const userDetails = {
        user_name: req.body.user_name,
        email: req.body.email,
        password: hashed_password

    }
  
    let data = userData(userDetails)
    await data.save()
    res.redirect('/login')
    // res.send('books added')
})

 app.get('/login',(req,res)=>{
     res.render('login')
 })
 app.post('/login',(req,res)=>{
    let loginDetails = {
        email : req.body.email,
        password:req.body.password
    }
     userData.find().then((result)=>{
         let data= result ;
 
         data.forEach(async (item) => {
             if(loginDetails.email == item.email){
                await bcrypt.compare(loginDetails.password,item.password).then((result)=>{
                     console.log('bcrypt res',result)
                     if(result){
                         // creating session variable to check if user loggedin
                         req.session.isAuth=true
                         res.redirect('/home')
                     }
                     else {
                         console.log("password mismatch")
                     }
                  
                 })
             
         
             }
             else {
                 // res.redirect('/')
                 console.log('else')
             }
         });
     });
     // userData.findOne({email:loginDetails.email })
     // res.send("login")
     console.log('logindetails',loginDetails)
     
 
 })

app.get('/logout',(req,res)=>{
  req.session.destroy()
     res.redirect('/')
 })



app.listen(8080)