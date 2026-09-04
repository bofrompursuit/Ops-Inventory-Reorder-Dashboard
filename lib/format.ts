const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value)
}

const numberFormatter = new Intl.NumberFormat("en-US")

export function formatNumber(value: number): string {
  return numberFormatter.format(value)
}
