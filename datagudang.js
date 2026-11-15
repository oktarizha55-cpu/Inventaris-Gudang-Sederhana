// Modul data: array berisi object literal.
// module.exports membuat array ini bisa dipakai file lain lewat require.

const daftarBarang = [
  { id: 1, nama: "Kardus Besar", kategori: "Kemasan", harga: 5000, stok: 120 },
  { id: 2, nama: "Lakban Bening", kategori: "Kemasan", harga: 12000, stok: 8 },
  { id: 3, nama: "Rak Besi", kategori: "Perabot", harga: 350000, stok: 15 },
  { id: 4, nama: "Troli Barang", kategori: "Peralatan", harga: 450000, stok: 0 },
  { id: 5, nama: "Sarung Tangan Kerja", kategori: "Keselamatan", harga: 25000, stok: 40 },
];

module.exports = daftarBarang;
