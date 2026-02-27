import { Smartphone, Laptop, Tablet, Watch, Speaker, Headphones } from 'lucide-react';

export const categoryIconMap = {
    telefonos: Smartphone,
    notebooks: Laptop,
    tablets: Tablet,
    smartwatches: Watch,
    parlantes: Speaker,
    accesorios: Headphones,
};

export function getCategoryIcon(slug) {
    return categoryIconMap[slug] || Smartphone;
}

export function getCategoryEmoji(slug) {
    const map = {
        telefonos: '📱',
        notebooks: '💻',
        tablets: '📟',
        smartwatches: '⌚',
        parlantes: '🔊',
        accesorios: '🎧',
    };
    return map[slug] || '📦';
}
