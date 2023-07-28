const mongoose = require('mongoose')
const Campground = require('../models/campground')
const cities = require('./cities')
const { places, descriptors } = require('./seedHelpers')

mongoose.connect('mongodb://localhost:27017/camp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {
  console.log('Database connected.')
})

const sample = array => {
  return array[Math.floor(Math.random() * array.length)]
}

const seedDb = async () => {
  await Campground.deleteMany({})
  for (let i = 0; i < 300; i++) {
    const random1000 = Math.floor(Math.random() * 1000)
    const randomPrice = Math.floor(Math.random() * 20) + 10
    const camp = new Campground({
      author: '64b79d7249f60ad02e101dd0',
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      images: [
        {
          url:'https://res.cloudinary.com/dpjceko3k/image/upload/v1690485432/Camp/ax5undcsdn9qnmnxnbrc.jpg',
          filename:'Camp/ax5undcsdn9qnmnxnbrc'
        },
        {
          url: 'https://res.cloudinary.com/dpjceko3k/image/upload/v1690485446/Camp/bu8dmyf7de01cybb4vz3.jpg',
          filename:'Camp/bu8dmyf7de01cybb4vz3'
        },
        {
          url: 'https://res.cloudinary.com/dpjceko3k/image/upload/v1690485796/Camp/spuh2xspzbgfuuymenl7.jpg',
          filename: 'Camp/spuh2xspzbgfuuymenl7'        
        }, 
      ],
      description:
        'Lorem ipsum dolor sit amet consectetur adipisicing elit. Id quo eveniet praesentium aut suscipit dolores optio nam incidunt voluptatibus nesciunt corporis, repudiandae facilis pariatur eos, nisi blanditiis doloremque odit porro.',
      price: randomPrice,
      geometry:{
        type: "Point",
        coordinates:[cities[random1000].longitude, cities[random1000].latitude]
      }
    })

    await camp.save()
  }
}

seedDb().then(() => {
  mongoose.connection.close()
})
