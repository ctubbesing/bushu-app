const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) {
    return '?'
  }
  const doDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(dateStr)
  return (new Date(dateStr)).toLocaleDateString('en-US', doDateOnly ? {timeZone: 'UTC'} : undefined)
}

export default formatDate
