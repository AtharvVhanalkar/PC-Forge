export type PrebuiltCategory = 'Gaming' | 'Workstation' | 'Monthly Drop'
export type PrebuiltStockStatus = 'in-stock' | 'low-stock' | 'made-to-order'

export interface PrebuiltSpecs {
  CPU: string
  GPU: string
  RAM: string
  Storage: string
  Motherboard: string
  PSU: string
  Case: string
  Cooling: string
}

export interface PrebuiltFps {
  '1080p': number
  '1440p': number
}

export interface Prebuilt {
  id: string
  name: string
  tagline: string
  price: number
  category: PrebuiltCategory
  colorTheme: string
  specs: PrebuiltSpecs
  fps: PrebuiltFps
  images: string[]
  stockStatus: PrebuiltStockStatus
  badges: string[]
  rating: number
}

const pcImage = 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=1200&q=80'
const snowImage = 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=1200&q=80'

export const prebuilts: Prebuilt[] = [
  {
    id: 'scarlet-fury',
    name: 'Scarlet Fury',
    tagline: 'A high-refresh-rate gaming rig built to dominate.',
    price: 2499,
    category: 'Gaming',
    colorTheme: 'Scarlet red and matte black',
    specs: {
      CPU: 'AMD Ryzen 7 9800X3D',
      GPU: 'NVIDIA GeForce RTX 5080 16GB',
      RAM: '32GB DDR5-6000',
      Storage: '2TB PCIe 4.0 NVMe SSD',
      Motherboard: 'MSI MAG X870 Tomahawk WiFi',
      PSU: '1000W 80+ Gold ATX 3.1',
      Case: 'Lian Li Lancool 216',
      Cooling: '360mm all-in-one liquid cooler',
    },
    fps: { '1080p': 240, '1440p': 180 },
    images: [pcImage, snowImage],
    stockStatus: 'in-stock',
    badges: ['Best Seller', 'VR Ready'],
    rating: 4.9,
  },
  {
    id: 'frost-nova',
    name: 'Frost Nova',
    tagline: 'Cool, quiet performance in a clean white finish.',
    price: 1999,
    category: 'Gaming',
    colorTheme: 'Arctic white and ice blue',
    specs: {
      CPU: 'AMD Ryzen 7 9700X',
      GPU: 'NVIDIA GeForce RTX 5070 Ti 16GB',
      RAM: '32GB DDR5-6000',
      Storage: '2TB PCIe 4.0 NVMe SSD',
      Motherboard: 'ASUS ROG Strix B850-A Gaming WiFi',
      PSU: '850W 80+ Gold ATX 3.1',
      Case: 'NZXT H6 Flow White',
      Cooling: '360mm white all-in-one liquid cooler',
    },
    fps: { '1080p': 220, '1440p': 155 },
    images: [snowImage, pcImage],
    stockStatus: 'in-stock',
    badges: ['New Arrival'],
    rating: 4.8,
  },
  {
    id: 'midnight-ghost',
    name: 'Midnight Ghost',
    tagline: 'Stealth looks with the power to disappear into any game.',
    price: 1699,
    category: 'Gaming',
    colorTheme: 'Midnight black with violet accents',
    specs: {
      CPU: 'AMD Ryzen 5 9600X',
      GPU: 'NVIDIA GeForce RTX 5070 12GB',
      RAM: '32GB DDR5-6000',
      Storage: '1TB PCIe 4.0 NVMe SSD',
      Motherboard: 'Gigabyte B850 AORUS Elite WiFi7',
      PSU: '850W 80+ Gold ATX 3.1',
      Case: 'Fractal Design North Charcoal',
      Cooling: 'Dual-tower air cooler',
    },
    fps: { '1080p': 195, '1440p': 135 },
    images: [pcImage],
    stockStatus: 'low-stock',
    badges: ['Popular'],
    rating: 4.7,
  },
  {
    id: 'titan-forge',
    name: 'Titan Forge',
    tagline: 'A workstation powerhouse for demanding creative pipelines.',
    price: 4299,
    category: 'Workstation',
    colorTheme: 'Graphite and titanium',
    specs: {
      CPU: 'AMD Ryzen Threadripper 7960X',
      GPU: 'NVIDIA GeForce RTX 5090 32GB',
      RAM: '128GB DDR5-5600',
      Storage: '4TB PCIe 5.0 NVMe SSD',
      Motherboard: 'ASUS Pro WS TRX50-SAGE WiFi',
      PSU: '1200W 80+ Platinum ATX 3.1',
      Case: 'Fractal Design Define 7 XL',
      Cooling: '420mm workstation liquid cooler',
    },
    fps: { '1080p': 260, '1440p': 205 },
    images: [pcImage],
    stockStatus: 'made-to-order',
    badges: ['Creator Pick', 'Pro'],
    rating: 5,
  },
  {
    id: 'ember-strike',
    name: 'Ember Strike',
    tagline: 'Balanced 1440p performance with room to grow.',
    price: 1399,
    category: 'Gaming',
    colorTheme: 'Ember orange and charcoal',
    specs: {
      CPU: 'AMD Ryzen 5 7600',
      GPU: 'AMD Radeon RX 9070 16GB',
      RAM: '32GB DDR5-6000',
      Storage: '1TB PCIe 4.0 NVMe SSD',
      Motherboard: 'ASRock B650 Steel Legend WiFi',
      PSU: '750W 80+ Gold ATX 3.0',
      Case: 'Montech Air 903 Max',
      Cooling: '240mm all-in-one liquid cooler',
    },
    fps: { '1080p': 180, '1440p': 125 },
    images: [pcImage],
    stockStatus: 'in-stock',
    badges: ['Great Value'],
    rating: 4.6,
  },
  {
    id: 'studio-spectrum',
    name: 'Studio Spectrum',
    tagline: 'Color-accurate creative work meets dependable multitasking.',
    price: 2899,
    category: 'Workstation',
    colorTheme: 'Silver and soft white',
    specs: {
      CPU: 'AMD Ryzen 9 9950X',
      GPU: 'NVIDIA GeForce RTX 5080 16GB',
      RAM: '96GB DDR5-6000',
      Storage: '4TB PCIe 4.0 NVMe SSD',
      Motherboard: 'ASUS ProArt X870E-Creator WiFi',
      PSU: '1000W 80+ Platinum ATX 3.1',
      Case: 'Fractal Design North XL Chalk',
      Cooling: '360mm all-in-one liquid cooler',
    },
    fps: { '1080p': 245, '1440p': 185 },
    images: [snowImage],
    stockStatus: 'made-to-order',
    badges: ['Creator Pick'],
    rating: 4.9,
  },
  {
    id: 'redline-rush',
    name: 'Redline Rush',
    tagline: 'A compact monthly drop tuned for competitive play.',
    price: 1199,
    category: 'Monthly Drop',
    colorTheme: 'Racing red and carbon black',
    specs: {
      CPU: 'AMD Ryzen 5 7500F',
      GPU: 'AMD Radeon RX 9060 XT 16GB',
      RAM: '32GB DDR5-5600',
      Storage: '1TB PCIe 4.0 NVMe SSD',
      Motherboard: 'MSI PRO B650M-A WiFi',
      PSU: '750W 80+ Gold ATX 3.0',
      Case: 'Cooler Master MasterBox TD300 Mesh',
      Cooling: '120mm tower air cooler',
    },
    fps: { '1080p': 165, '1440p': 112 },
    images: [pcImage],
    stockStatus: 'low-stock',
    badges: ['Monthly Drop', 'Limited'],
    rating: 4.5,
  },
  {
    id: 'aurora-render',
    name: 'Aurora Render',
    tagline: 'Multi-threaded compute power for renderers and virtual studios.',
    price: 3599,
    category: 'Workstation',
    colorTheme: 'Aurora green and deep navy',
    specs: {
      CPU: 'AMD Ryzen 9 9950X',
      GPU: 'NVIDIA GeForce RTX 5090 32GB',
      RAM: '128GB DDR5-6000',
      Storage: '2TB PCIe 5.0 NVMe SSD + 4TB NVMe SSD',
      Motherboard: 'MSI MEG X870E ACE',
      PSU: '1200W 80+ Platinum ATX 3.1',
      Case: 'Lian Li O11 Dynamic EVO XL',
      Cooling: '420mm all-in-one liquid cooler',
    },
    fps: { '1080p': 275, '1440p': 215 },
    images: [snowImage, pcImage],
    stockStatus: 'made-to-order',
    badges: ['Pro', 'Creator Pick'],
    rating: 4.9,
  },
]
