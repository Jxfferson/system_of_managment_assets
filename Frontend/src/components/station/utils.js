export const UNIQUE_ITEMS_PER_STATION = [
  'teclado', 'keyboard', 'mouse', 
  'extension', 'conversor', 'ethernet'
];

export const ALLOW_DUPLICATES_ITEMS = [
  'cable', 'display', 'monitor', 'pantalla', 'hdmi', 'vga', 'lan'
];

export const getItemIconName = (itemName) => {
  const name = itemName.toLowerCase();
  if (name.includes('monitor') || name.includes('pantalla')) return 'monitor';
  if (name.includes('mouse')) return 'mouse';
  if (name.includes('teclado') || name.includes('keyboard')) return 'keyboard';
  if (name.includes('cable')) return 'cable';
  if (name.includes('cpu') || name.includes('computer')) return 'harddrive';
  return 'package';
};

export const getMonitorBadgeColor = (location) => {
  return location === 'Left' 
    ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    : 'bg-purple-500/20 text-purple-300 border-purple-500/30';
};