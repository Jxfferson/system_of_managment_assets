export function formatRelativeTime(dateString) {
  if (!dateString) return "N/A";
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);

  if (diffMonth >= 1) return diffMonth === 1 ? 'hace 1 mes' : `hace ${diffMonth} meses`;
  if (diffWeek >= 1) return diffWeek === 1 ? 'hace 1 semana' : `hace ${diffWeek} semanas`;
  if (diffDay >= 1) return diffDay === 1 ? 'hace 1 día' : `hace ${diffDay} días`;
  if (diffHr >= 1) return diffHr === 1 ? 'hace 1 hora' : `hace ${diffHr} horas`;
  if (diffMin >= 1) return diffMin === 1 ? 'hace 1 minuto' : `hace ${diffMin} minutos`;
  return "hace poco";
}