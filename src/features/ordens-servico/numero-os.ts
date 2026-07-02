export function gerarNumeroOs(date = new Date()): string {
  const year = date.getFullYear()
  const timestampPart = [
    date.getMonth() + 1,
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
  ]
    .map((part) => String(part).padStart(2, '0'))
    .join('')
  const randomPart = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0')

  return 'OS' + year + timestampPart + randomPart
}
