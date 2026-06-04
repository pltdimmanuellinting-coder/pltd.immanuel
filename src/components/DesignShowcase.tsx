import React from 'react';
import { ChevronLeft, Check } from 'lucide-react';
import PageHeader from './PageHeader';

const mockups = [
  {
    id: 'minimalist',
    title: 'Modern Minimalist',
    description: 'Clean, light, and focused on content.',
    path: '/src/assets/images/modern_minimalist_ui_1779832976607.png'
  },
  {
    id: 'glassmorphic',
    title: 'Glassmorphism',
    description: 'Translucent layers and vibrant gradients.',
    path: '/src/assets/images/glassmorphic_header_ui_1779832996229.png'
  },
  {
    id: 'brutalist',
    title: 'Brutalist Tech',
    description: 'High contrast and bold geometric shapes.',
    path: '/src/assets/images/brutalist_tech_ui_1779833010050.png'
  },
  {
    id: 'bento',
    title: 'Bento Shadow',
    description: 'Organized grid with soft shadows.',
    path: '/src/assets/images/bento_shadow_ui_1779833026592.png'
  },
  {
    id: 'editorial',
    title: 'Editorial Bold',
    description: 'Sophisticated typography and bold blocks.',
    path: '/src/assets/images/editorial_bold_ui_modern_1779833043361.png'
  },
  {
    id: 'cyberpunk',
    title: 'Cyberpunk Neon',
    description: 'Dark background with vibrant neon pink and cyan accents.',
    path: 'https://placehold.co/600x400/0a0a14/00f2ff?text=Cyberpunk+Neon'
  },
  {
    id: 'pastel',
    title: 'Soft Pastel Dream',
    description: 'Gentle, soothing colors for a calm experience.',
    path: 'https://placehold.co/600x400/fef2f2/f87171?text=Soft+Pastel'
  },
  {
    id: 'deep-space',
    title: 'Deep Space',
    description: 'Immersive dark theme with cosmic violet highlights.',
    path: 'https://placehold.co/600x400/020617/7c3aed?text=Deep+Space'
  },
  {
    id: 'emerald',
    title: 'Emerald Nature',
    description: 'Fresh green tones inspired by the natural world.',
    path: 'https://placehold.co/600x400/ecfdf5/059669?text=Emerald+Nature'
  },
  {
    id: 'royal-gold',
    title: 'Royal Blue & Gold',
    description: 'High-end luxury feel with navy and gold pairing.',
    path: 'https://placehold.co/600x400/1e3a8a/d4af37?text=Royal+Gold'
  },
  {
    id: 'crimson',
    title: 'Crimson Luxury',
    description: 'Bold red backgrounds for a powerful statement.',
    path: 'https://placehold.co/600x400/450a0a/dc2626?text=Crimson+Luxury'
  },
  {
    id: 'swiss',
    title: 'Swiss Modernist',
    description: 'Grid-based, structured, and extremely legible.',
    path: 'https://placehold.co/600x400/ffffff/000000?text=Swiss+Modernist'
  },
  {
    id: 'retro-win95',
    title: 'Retro Desktop',
    description: 'Classic 90s OS aesthetic with gray panels.',
    path: 'https://placehold.co/600x400/c0c0c0/000080?text=Retro+Desktop'
  },
  {
    id: 'coffee',
    title: 'Coffee & Cream',
    description: 'Warm earthy tones for a cozy interface.',
    path: 'https://placehold.co/600x400/fafaf9/78350f?text=Coffee+Cream'
  },
  {
    id: 'terminal',
    title: 'Terminal / Matrix',
    description: 'Monochrome green on black, hacker style.',
    path: '/src/assets/images/theme_terminal_1779852297917.png'
  },
  {
    id: 'glass',
    title: 'Glassmorphism',
    description: 'Translucent panels with vibrant background blur.',
    path: '/src/assets/images/theme_glass_1779852319090.png'
  },
  {
    id: 'neo-brutalist',
    title: 'Neo-Brutalism',
    description: 'High contrast, black borders, and vibrant colors.',
    path: '/src/assets/images/theme_brutalist_1779852335370.png'
  },
  {
    id: 'minimal-dark',
    title: 'Minimalist Dark',
    description: 'Clean, understated dark mode with charcoal grays.',
    path: '/src/assets/images/theme_minimal_1779852353359.png'
  },
  {
    id: 'nordic',
    title: 'Nordic Frost',
    description: 'Icy blues and whites for a clean, cold look.',
    path: '/src/assets/images/theme_nordic_1779852368177.png'
  }
];

export default function DesignShowcase({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col h-[100dvh] bg-slate-50 relative overflow-hidden">
      <PageHeader title="DESIGN GALLERY" onBack={onBack} />
      
      <div className="flex-1 overflow-y-auto p-4 space-y-8 pb-32">
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
          <p className="text-xs text-blue-700 font-medium leading-relaxed">
            Silakan pilih gaya desain yang Anda inginkan untuk Header dan elemen UI lainnya. 
            Setelah Anda memilih, saya akan mengimplementasikan gaya tersebut ke seluruh aplikasi.
          </p>
        </div>

        {mockups.map((mockup) => (
          <div key={mockup.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-800 uppercase text-xs tracking-wider">{mockup.title}</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">{mockup.description}</p>
              </div>
              <button className="bg-blue-600 text-white p-2 rounded-xl active:scale-95 transition-all">
                <Check size={16} />
              </button>
            </div>
            <div className="aspect-[4/3] bg-slate-100 relative">
              <img 
                src={mockup.path} 
                alt={mockup.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://placehold.co/600x400?text=Image+Loading...';
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
