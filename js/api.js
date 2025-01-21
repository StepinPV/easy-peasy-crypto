class CryptoAPI {
  static async getPrices(cryptoIds) {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoIds}&vs_currencies=usd`
    );
    return await response.json();
  }
}
