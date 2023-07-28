if(process.env.NODE_ENV != "production"){
  require('dotenv').config()
}
//require('dotenv').config()

const express = require('express') 
const app = express()
const path = require('path') 
const mongoose = require('mongoose') 

const ExpressError = require('./utilities/ExpressError') 

app.use(express.urlencoded({ extended: true }))
const methodOverride = require('method-override') 
app.use(methodOverride('_method'))

const ejsMate = require('ejs-mate') 
app.engine('ejs', ejsMate)

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

//connection
const MongoStore = require('connect-mongo')
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/camp'
const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto:{
    secret:'needsBetter!'
  }
})

mongoose.connect(dbUrl, { })
//mongoose.connect('mongodb://localhost:27017/camp', { })

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {
  console.log('Database connected.')
})

//for static folder
app.use(express.static(path.join(__dirname, 'public')))

//for session with cookie (expires: 1 week)
const session = require('express-session')
const secret = process.env.SECRET || 'needsBetter!'
const sessionConfig = {
  name: 'session',
  secret: secret,
  resave: false,
  saveUninitialized: true,
  cookie:{
    httpOnly: true,
    //secure:true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  },
  store: MongoStore.create({mongoUrl: dbUrl, secret: secret})
}
app.use(session(sessionConfig))


//for flash
const flash = require('connect-flash')
app.use(flash())

//for security
const mongoSanitize = require('express-mongo-sanitize')
app.use(mongoSanitize({replaceWith:'_'}))
const helmet = require('helmet')
app.use(helmet())
const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net/",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net/"
];
const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
      directives: {
          defaultSrc: [],
          connectSrc: ["'self'", ...connectSrcUrls],
          scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
          styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
          workerSrc: ["'self'", "blob:"],
          objectSrc: [],
          imgSrc: [
              "'self'",
              "blob:",
              "data:",
              "https://res.cloudinary.com/"+process.env.CLOUDINARY_CLOUD_NAME+"/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
              "https://images.unsplash.com/",
          ],
          fontSrc: ["'self'", ...fontSrcUrls],
      },
  })
);


//for passport authentication
const passport = require('passport')
const localStrategy = require('passport-local')
app.use(passport.initialize())
app.use(passport.session())
const User = require('./models/user')
passport.use(new localStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

//for flash
app.use((req,res,next)=>{
  res.locals.currentUser = req.user
  res.locals.success = req.flash('success')
  res.locals.error = req.flash('error')
  next()
})


//for Routers
const campgroundRoutes = require('./routes/campgrounds') 
app.use('/campgrounds', campgroundRoutes)

const reviewRoutes = require('./routes/reviews')
app.use('/campgrounds/:id/reviews', reviewRoutes)

const userRoutes = require('./routes/users') 
app.use('/', userRoutes)


//REGISTER FAKE USER
app.get('/fakeUser', async(req, res) => {
  const user = new User({email:'coltt@gmail.com', username: 'coltt'})
  const newUser = await User.register(user, 'chicken')
  res.send(newUser)
})


app.get('/', (req, res) => {
  res.render('home')
})

app.all('*', (req, res, next) => {
  next(new ExpressError('Page not found', 404))
})

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err
  if (!err.message) {
    err.message = 'Oh no. Something went wrong'
  }
  res.status(statusCode).render('error', { err })
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})
