import AddSupplierImage from '../Images/FindAnySupplier.png';
import ExploreImage from '../Images/Explore.png';
import StayInformedImage from '../Images/StayInformed.png';
import EnjoyTheExperienceImage from '../Images/EnjoyTheExperience.png';
import UserImage from '../Images/ClientSettingImage.png';


export const tags = [
  'All Restaurants',
  'Asian Restaurant',
  'Cafe',
  'Mall Road',
  'Indian Restaurant',
  'Beach Road',
  'Ring Road'
]

export const tagColors = {
  'All Restaurants': "#FFD700",
  'Asian Restaurant': "#FF5733",
  'Cafe': "#8A2BE2",
  'Mall Road': "#1E90FF",
  'Indian Restaurant': "#32CD32",
  "Beach Road": "#FF4500",
  "Ring Marg": "#FF1493",
}
export const categories = [
  {name: 'Vegetables', image: 'https://firebasestorage.googleapis.com/v0/b/prockured-1ec23.firebasestorage.app/o/Images%2Fvegetables.png?alt=media&token=53260745-7f43-45aa-8bd4-585fb38ed1f7'},
  {name: 'Fruits', image: 'https://firebasestorage.googleapis.com/v0/b/prockured-1ec23.firebasestorage.app/o/Images%2Ffruits.png?alt=media&token=211f8eaa-5971-417f-bc7f-c134a957b8c9'},
]
export const Vegetable_Categories = [
  {id: 1, title: 'Beetroot'},
  {id: 2, title: 'Brinjal'},
  {id: 3, title: 'Broccoli'},
  {id: 4, title: 'Cabbage'},
  {id: 5, title: 'Carrots'},
  {id: 6, title: 'Cauliflower'},
  {id: 7, title: 'Celery'},
  {id: 8, title: 'Cucumber'},
  {id: 9, title: 'Garlic'},
  {id: 10, title: 'Ginger'},
  {id: 11, title: 'Lettuce'},
  {id: 12, title: 'Mushroom'},
  {id: 13, title: 'Onion'},
  {id: 14, title: 'Potato'},
  {id: 15, title: 'Pumpkin'}
]
export const worksData = [
  { id: 1, title: 'Find your supplies', description: 'Discover top vendors', image: AddSupplierImage, screen: 'Search Bar'},
  { id: 2, title: 'Explore', description: 'Effortless browsing!', image: ExploreImage},
  { id: 3, title: 'Stay Informed', description: 'Track your orders easily', image: StayInformedImage, screen: 'Orders'},
  { id: 4, title: 'Enjoy the experience', description: 'Share your feedback', image: EnjoyTheExperienceImage},
];
export const Fruit_Categories = [
  { id: 1, title: 'Apple'},
  { id: 2, title: 'Apricot'},
  { id: 3, title: 'Banana'},
  { id: 4, title: 'Cherry'},
  { id: 5, title: 'Coconut'},
  { id: 6, title: 'Guava'},
  { id: 7, title: 'Lemon'},
  { id: 8, title: 'Mango'},
  { id: 9, title: 'Orange'},
  { id: 10, title: 'Peach'},
]
export const customers = [
  {
    id: 1,
    name: "Bite & Co.",
    customerName: 'Mr. Karan Rao',
    customerNumber: '+91 9876543210',
    customerLocation: 'Jaipur',
    orderTotal: "₹ 14,375",
    orderDate: "25-06-2024",
    tags: ["All Restaurants", "Asian Restaurant"],
    pastOrders: [
      { PastOrderDate: "25-06-2024", MostOrdered: "Zuccini", NumberOfItems: "50", TotalValue: "4,375" },
      { PastOrderDate: "16-06-2024", MostOrdered: "Carrot", NumberOfItems: "45", TotalValue: "8,375" },
      { PastOrderDate: "08-06-2024", MostOrdered: "Tomato", NumberOfItems: "15", TotalValue: "7,375" }
    ]
  },
  {
    id: 2,
    name: "Munch",
    customerName: 'Mr. Rao',
    customerNumber: '+91 9876543210',
    customerLocation: 'Jaipur',
    orderTotal: "₹ 9,375",
    orderDate: "24-06-2024",
    tags: ["Cafe", "Mall Road"],
    pastOrders: [
      { PastOrderDate: "01-06-2024", MostOrdered: "Potato", NumberOfItems: "45", TotalValue: "10,542" },
      { PastOrderDate: "28-05-2024", MostOrdered: "Tomato", NumberOfItems: "15", TotalValue: "7,375" }
    ]
  },
  {
    id: 3,
    name: "Sabali",
    customerName: 'Mr. Axar',
    customerNumber: '+91 9876543210',
    customerLocation: 'Jaipur',
    orderTotal: "₹ 4,375",
    orderDate: "18-06-2024",
    tags: ['Asian Restaurant'],
    pastOrders: [
      { PastOrderDate: "01-06-2024", MostOrdered: "Potato", NumberOfItems: "45", TotalValue: "10,542" },
      { PastOrderDate: "28-05-2024", MostOrdered: "Tomato", NumberOfItems: "15", TotalValue: "7,375" }
    ]
  },
  {
    id: 4,
    name: "Taste",
    customerName: 'Mr. Karan',
    customerNumber: '+91 9876543210',
    customerLocation: 'Jaipur',
    orderTotal: "₹ 12,584",
    orderDate: "04-06-2024",
    tags: ["Cafe", "Ring Marg"],
    pastOrders: [
      { PastOrderDate: "01-06-2024", MostOrdered: "Potato", NumberOfItems: "45", TotalValue: "10,542" },
      { PastOrderDate: "28-05-2024", MostOrdered: "Tomato", NumberOfItems: "15", TotalValue: "7,375" }
    ]
  },
  {
    id: 5,
    name: "Kinara",
    customerName: 'Mr. Kush',
    customerNumber: '+91 9876543210',
    customerLocation: 'Jaipur',
    orderTotal: "₹ 25,375",
    orderDate: "03-06-2024",
    tags: ['Indian Restaurant', 'Beach Road'],
    pastOrders: [
      { PastOrderDate: "01-06-2024", MostOrdered: "Potato", NumberOfItems: "45", TotalValue: "10,542" },
      { PastOrderDate: "28-05-2024", MostOrdered: "Tomato", NumberOfItems: "15", TotalValue: "7,375" }
    ]
  },
  {
    id: 6,
    name: "Savar",
    customerName: 'Mrs. Shilpa Rao',
    customerNumber: '+91 9876543210',
    customerLocation: 'Jaipur',
    orderTotal: "₹ 9,375",
    orderDate: "24-06-2024",
    tags: ['Asian Restaurant'],
    pastOrders: [
      { PastOrderDate: "01-06-2024", MostOrdered: "Potato", NumberOfItems: "45", TotalValue: "10,542" },
      { PastOrderDate: "28-05-2024", MostOrdered: "Tomato", NumberOfItems: "15", TotalValue: "7,375" }
    ]
  }
];
export const myCatalogueProducts = [
  {
    name: 'Zucchini',
    category: "VeggieVital",
    pricePerKg: 3000,
    pricePerCarton: 27000,
    quantity: 0,
    image: require('../Images/ClientSettingImage.png')
  },
  {
    name: 'Red Capsicum',
    category: "Veggie",
    pricePerKg: 700,
    pricePerCarton: 6300,
    quantity: 0,
    image: require('../Images/ClientSettingImage.png')
  },
  {
    name: 'Red Cabbage',
    category: "Vegetable",
    pricePerKg: 1000,
    pricePerCarton: 9000,
    quantity: 0,
    image: require('../Images/ClientSettingImage.png')
  },
];
export const suppliersCatalogueProducts = [
  {
    name: 'Spinach',
    category: "Leafy Green",
    pricePerKg: 50,
    pricePerCarton: 450,
    quantity: 0,
    image: require('../Images/ClientSettingImage.png')
  },
  {
    name: 'Broccoli',
    category: "Cruciferous",
    pricePerKg: 120,
    pricePerCarton: 1080,
    quantity: 0,
    image: require('../Images/ClientSettingImage.png')
  },
  {
    name: 'Cauliflower',
    category: "Cruciferous",
    pricePerKg: 80,
    pricePerCarton: 720,
    quantity: 0,
    image: require('../Images/ClientSettingImage.png')
  },
];
export const faqData = [
  {
    id: "shipping",
    title: "Shipping",
    questions: [
      {
        id: "q1",
        question: "What is your shipping policy?",
        answer: "Our shipping policy ensures timely and secure delivery. Orders are processed within [X] business days, with delivery taking [X-Y] days based on location. Shipping charges vary, and tracking details will be provided once shipped. International shipping is available with applicable customs duties. For more details, visit our [Shipping Policy Page] or contact support.",
      },
      {
        id: "q2",
        question: "What is the status of my order?",
        answer: "You can track your order in your account under 'My Orders'."
      },
      {
        id: "q3",
        question: "Can I change my order?",
        answer: "Orders can be changed within 24 hours of placing them."
      },
    ],
  },
  {
    id: "payment",
    title: "Payment",
    questions: [
      {
        id: "q4",
        question: "What payment methods do you use?",
        answer: "We accept credit/debit cards, PayPal, and other online payment methods."
      },
      {
        id: "q5",
        question: "What are the refund policies you have?",
        answer: "Refunds are processed within 5-7 business days upon approval."
      },
    ],
  },
];
export  const vendorExistingPresets = [
  {
    id: "drafts",
    title: "Drafts",
    questions: [
      {
        id: "q1",
        taglineText: "Wake Up to Savings! Get 15% off our best blends. Brew happiness every morning",
        date: '25',
        month: 'March',
        year: '2025',
        hourTime: '10',
        hourMinute: '00',
        time: 'AM',
        tags: ['All Restaurants', 'Ring Marg', 'SB Road']
      },
      {
        id: "q2",
        taglineText: "Creamy Delight at a Discount! Enjoy 20% off. Perfect for you next gucamole!",
        date: '12',
        month: 'March',
        year: '2025',
        hourTime: '10',
        hourMinute: '30',
        time: 'AM',
        tags: ['All Restaurants', 'Cafe', 'Beach Road']
      },
    ],
  },
  {
    id: "previousCampaign",
    title: "Previous Campaign",
    questions: [
      {
        id: "q4",
        taglineText: "Ocean to Plate! Dive into a 15% discount. Fresh, Flavorful and responsibly sourced.",
        date: '23',
        month: 'March',
        year: '2025',
        hourTime: '12',
        hourMinute: '00',
        time: 'PM',
        tags: ['All Restaurants', 'Indian Restaurant', 'Mall Road']
      },
      {
        id: "q5",
        taglineText: "Sweet Deal Alert! Now 15% off. Picked at peak ripeness for maximum flavor",
        date: '02',
        month: 'March',
        year: '2025',
        hourTime: '01',
        hourMinute: '30',
        time: 'PM',
        tags: ['All Restaurants', 'Ring Marg', 'SB Road']
      },
      {
        id: "q6",
        taglineText: "Fresh Stock Just In! Quench your thirst with nature's finest. Order Now!",
        date: '03',
        month: 'March',
        year: '2025',
        hourTime: '09',
        hourMinute: '30',
        time: 'AM',
        tags: ['Asian Restaurants', 'Ring Marg', 'Mall Road']
      },
      {
        id: "q7",
        taglineText: "Color Your Plate! Enjoy 10% off. Add a pop of flavor and color to your meals.",
        date: '04',
        month: 'March',
        year: '2025',
        hourTime: '09',
        hourMinute: '00',
        time: 'PM',
        tags: ['All Restaurants', 'Ring Marg', 'SB Road']
      },
      {
        id: "q8",
        taglineText: "Get the best organic carrots at unbeatable prices - 10% off this week only",
        date: '02',
        month: 'March',
        year: '2025',
        hourTime: '10',
        hourMinute: '00',
        time: 'PM',
        tags: ['All Restaurants', 'Ring Marg', 'SB Road']
      },
    ],
  },
];
export const orders = [
  { vendor: 'Frugreen', orderValue: '2420', status: 'Pending' },
  { vendor: 'Coastal', orderValue: '56620', status: 'Pending' },
  { vendor: 'Suparna\'s', orderValue: '4285', status: 'Pending' },
  { vendor: 'DM Agro', orderValue: '5677', status: 'Pending' },
  { vendor: 'Suparna\'s', orderValue: '4285', status: 'Confirmed' },
  { vendor: 'DM Agro', orderValue: '5677', status: 'Confirmed' },
  { vendor: 'Frugreen', orderValue: '2420', status: 'Past' },
  { vendor: 'Coastal', orderValue: '56620', status: 'Past' },
];
export const VendorOrders = [
  { supplier: "Jade's Cafe", orderValue: '2420', status: 'Pending', image: UserImage },
  { supplier: 'Coastal', orderValue: '56620', status: 'Pending', image: UserImage },
  { supplier: 'Savor', orderValue: '4285', status: 'Pending', image: UserImage },
  { supplier: 'DM Agro', orderValue: '5677', status: 'Pending', image: UserImage },
  { supplier: 'Suparna\'s', orderValue: '4285', status: 'Confirmed', image: UserImage },
  { supplier: 'DM Agro', orderValue: '5677', status: 'Confirmed', image: UserImage },
  { supplier: 'Frugreen', orderValue: '2420', status: 'Past', image: UserImage },
  { supplier: 'Coastal', orderValue: '56620', status: 'Past', image: UserImage },
];
