import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const locations = [
  // Major Cities
  { name: 'Paris', description: 'The City of Light', category: 'city', imageUrl: '/locations/paris.jpg' },
  { name: 'Tokyo', description: 'Modern metropolis meets ancient tradition', category: 'city', imageUrl: '/locations/tokyo.jpg' },
  { name: 'New York', description: 'The Big Apple', category: 'city', imageUrl: '/locations/new-york.jpg' },
  { name: 'London', description: 'Historic capital of England', category: 'city', imageUrl: '/locations/london.jpg' },
  { name: 'Dubai', description: 'City of superlatives', category: 'city', imageUrl: '/locations/dubai.jpg' },
  { name: 'Sydney', description: 'Harbor city with iconic opera house', category: 'city', imageUrl: '/locations/sydney.jpg' },
  { name: 'Rome', description: 'The Eternal City', category: 'city', imageUrl: '/locations/rome.jpg' },
  { name: 'Barcelona', description: 'Architecture and Mediterranean charm', category: 'city', imageUrl: '/locations/barcelona.jpg' },
  { name: 'Amsterdam', description: 'Canals and cycling culture', category: 'city', imageUrl: '/locations/amsterdam.jpg' },
  { name: 'Istanbul', description: 'Where East meets West', category: 'city', imageUrl: '/locations/istanbul.jpg' },
  
  // Natural Wonders
  { name: 'Maldives', description: 'Tropical paradise with overwater bungalows', category: 'natural', imageUrl: '/locations/maldives.jpg' },
  { name: 'Swiss Alps', description: 'Majestic mountain peaks and alpine villages', category: 'natural', imageUrl: '/locations/swiss-alps.jpg' },
  { name: 'Grand Canyon', description: 'Breathtaking natural wonder', category: 'natural', imageUrl: '/locations/grand-canyon.jpg' },
  { name: 'Northern Lights', description: 'Aurora borealis in the Arctic sky', category: 'natural', imageUrl: '/locations/northern-lights.jpg' },
  { name: 'Great Barrier Reef', description: 'World\'s largest coral reef system', category: 'natural', imageUrl: '/locations/great-barrier-reef.jpg' },
  { name: 'Mount Fuji', description: 'Japan\'s iconic volcanic peak', category: 'natural', imageUrl: '/locations/mount-fuji.jpg' },
  { name: 'Niagara Falls', description: 'Powerful waterfalls on the border', category: 'natural', imageUrl: '/locations/niagara-falls.jpg' },
  { name: 'Santorini', description: 'Greek island with stunning sunsets', category: 'natural', imageUrl: '/locations/santorini.jpg' },
  { name: 'Banff National Park', description: 'Canadian Rockies wilderness', category: 'natural', imageUrl: '/locations/banff.jpg' },
  { name: 'Iceland', description: 'Land of fire and ice', category: 'natural', imageUrl: '/locations/iceland.jpg' },
  
  // Cultural Sites
  { name: 'Machu Picchu', description: 'Ancient Incan citadel in the clouds', category: 'cultural', imageUrl: '/locations/machu-picchu.jpg' },
  { name: 'Taj Mahal', description: 'Monument to eternal love', category: 'cultural', imageUrl: '/locations/taj-mahal.jpg' },
  { name: 'Great Wall of China', description: 'Ancient defensive structure', category: 'cultural', imageUrl: '/locations/great-wall.jpg' },
  { name: 'Petra', description: 'Rose-red city carved in stone', category: 'cultural', imageUrl: '/locations/petra.jpg' },
  { name: 'Angkor Wat', description: 'Magnificent temple complex', category: 'cultural', imageUrl: '/locations/angkor-wat.jpg' },
  { name: 'Stonehenge', description: 'Mysterious ancient stone circle', category: 'cultural', imageUrl: '/locations/stonehenge.jpg' },
  { name: 'Easter Island', description: 'Mysterious moai statues', category: 'cultural', imageUrl: '/locations/easter-island.jpg' },
  { name: 'Chichen Itza', description: 'Ancient Mayan city', category: 'cultural', imageUrl: '/locations/chichen-itza.jpg' },
  { name: 'Acropolis', description: 'Ancient citadel of Athens', category: 'cultural', imageUrl: '/locations/acropolis.jpg' },
  { name: 'Colosseum', description: 'Ancient Roman amphitheater', category: 'cultural', imageUrl: '/locations/colosseum.jpg' },
  
  // Adventure Destinations
  { name: 'Patagonia', description: 'Wild landscapes at the end of the world', category: 'adventure', imageUrl: '/locations/patagonia.jpg' },
  { name: 'Nepal', description: 'Himalayan kingdom and trekking paradise', category: 'adventure', imageUrl: '/locations/nepal.jpg' },
  { name: 'New Zealand', description: 'Middle-earth landscapes', category: 'adventure', imageUrl: '/locations/new-zealand.jpg' },
  { name: 'Costa Rica', description: 'Biodiversity hotspot and eco-adventure', category: 'adventure', imageUrl: '/locations/costa-rica.jpg' },
  { name: 'Morocco', description: 'Desert dunes and ancient medinas', category: 'adventure', imageUrl: '/locations/morocco.jpg' },
  { name: 'Peru', description: 'Andean adventures and ancient cultures', category: 'adventure', imageUrl: '/locations/peru.jpg' },
  { name: 'Thailand', description: 'Tropical beaches and cultural treasures', category: 'adventure', imageUrl: '/locations/thailand.jpg' },
  { name: 'Vietnam', description: 'Southeast Asian charm and history', category: 'adventure', imageUrl: '/locations/vietnam.jpg' },
  { name: 'South Africa', description: 'Safari adventures and diverse landscapes', category: 'adventure', imageUrl: '/locations/south-africa.jpg' },
  { name: 'Brazil', description: 'Amazon rainforest and vibrant culture', category: 'adventure', imageUrl: '/locations/brazil.jpg' },
  
  // Unique Experiences
  { name: 'Antarctica', description: 'The last frontier of exploration', category: 'unique', imageUrl: '/locations/antarctica.jpg' },
  { name: 'Galapagos Islands', description: 'Evolution\'s living laboratory', category: 'unique', imageUrl: '/locations/galapagos.jpg' },
  { name: 'Bhutan', description: 'Happiness kingdom in the Himalayas', category: 'unique', imageUrl: '/locations/bhutan.jpg' },
  { name: 'Madagascar', description: 'Island of unique wildlife', category: 'unique', imageUrl: '/locations/madagascar.jpg' },
  { name: 'Greenland', description: 'Arctic wilderness and ice sheets', category: 'unique', imageUrl: '/locations/greenland.jpg' },
  { name: 'Fiji', description: 'South Pacific island paradise', category: 'unique', imageUrl: '/locations/fiji.jpg' },
  { name: 'Mauritius', description: 'Indian Ocean tropical gem', category: 'unique', imageUrl: '/locations/mauritius.jpg' },
  { name: 'Seychelles', description: 'Pristine beaches and granite islands', category: 'unique', imageUrl: '/locations/seychelles.jpg' },
  { name: 'Bora Bora', description: 'French Polynesian luxury', category: 'unique', imageUrl: '/locations/bora-bora.jpg' },
  { name: 'Monaco', description: 'Tiny principality of glamour', category: 'unique', imageUrl: '/locations/monaco.jpg' }
]

async function main() {
  console.log('🌍 Seeding travel locations...')
  
  // Clear existing locations
  await prisma.location.deleteMany()
  
  // Create all locations
  for (const location of locations) {
    await prisma.location.create({
      data: location
    })
  }
  
  console.log(`✅ Created ${locations.length} travel locations`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
