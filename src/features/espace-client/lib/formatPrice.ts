export const formatPrice = (price: number) =>
  price === 0
    ? "Gratuit"
    : `${new Intl.NumberFormat("fr-FR").format(price)} FCFA`;