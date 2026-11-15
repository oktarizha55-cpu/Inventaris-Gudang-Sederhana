const express = require("express"); // package dari npm
const daftarBarang = require("./datagudang"); // modul buatan sendiri
const app = express();

// Supaya Express bisa membaca data JSON yang dikirim dari Postman (POST dan PUT)
app.use(express.json());

// Variabel di luar rute: dibuat satu kali dan nilainya bertahan selama server hidup
const waktuMulai = new Date();
let idBerikutnya = daftarBarang.length + 1;

// ---------- Fungsi bantu ----------

// Percabangan: menentukan status stok
function tentukanStatus(stok) {
  if (stok === 0) {
    return "Habis";
  } else if (stok <= 10) {
    return "Menipis";
  } else {
    return "Aman";
  }
}

// Operator aritmatika: nilai = harga x stok
function tampilkanBarang(barang) {
  return {
    id: barang.id,
    nama: barang.nama,
    kategori: barang.kategori,
    harga: barang.harga,
    stok: barang.stok,
    status: tentukanStatus(barang.stok),
    nilai: barang.harga * barang.stok,
  };
}

// Mencari posisi barang di array berdasarkan id (perulangan), -1 kalau tidak ada
function cariIndeks(id) {
  for (let i = 0; i < daftarBarang.length; i++) {
    if (daftarBarang[i].id === id) {
      return i;
    }
  }
  return -1;
}

// ---------- Route umum ----------

// Teks biasa -> res.send
app.get("/", (req, res) => {
  res.send(
    "Selamat datang di server Kelompok Chernobyl - Inventaris Gudang Mini",
  );
});

// Waktu server dijalankan
app.get("/info", (req, res) => {
  const waktu = waktuMulai.toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    dateStyle: "full",
    timeStyle: "medium",
  });
  res.send(`Server dijalankan pada: ${waktu} WIB`);
});

// Data JSON berbentuk array berisi objek -> res.json
app.get("/anggota", (req, res) => {
  res.json([
    { nama: "Nixcen Eriana Rahmat", nim: "20250040069" },
    { nama: "Mohamad Rafie Oktarizha", nim: "20250040011" },
  ]);
});

// ---------- Route barang ----------

// MENAMPILKAN semua barang
app.get("/barang", (req, res) => {
  const hasil = [];
  for (let i = 0; i < daftarBarang.length; i++) {
    hasil.push(tampilkanBarang(daftarBarang[i]));
  }
  res.json(hasil);
});

// Statistik gudang: perulangan + aritmatika
// Letaknya harus di atas /barang/:id, kalau tidak "statistik" dianggap sebagai id
app.get("/barang/statistik", (req, res) => {
  let totalStok = 0;
  let totalNilai = 0;
  let jumlahHabis = 0;

  for (let i = 0; i < daftarBarang.length; i++) {
    const barang = daftarBarang[i];
    totalStok = totalStok + barang.stok;
    totalNilai = totalNilai + barang.harga * barang.stok;
    if (barang.stok === 0) {
      jumlahHabis++;
    }
  }

  res.json({
    totalJenis: daftarBarang.length,
    totalStok: totalStok,
    totalNilai: totalNilai,
    jumlahHabis: jumlahHabis,
  });
});

// MENCARI barang: /barang/cari?nama=lakban atau /barang/cari?kategori=kemasan
app.get("/barang/cari", (req, res) => {
  const nama = (req.query.nama || "").toLowerCase();
  const kategori = (req.query.kategori || "").toLowerCase();

  if (nama === "" && kategori === "") {
    return res.status(400).json({ pesan: "Isi parameter nama atau kategori" });
  }

  const hasil = [];
  for (let i = 0; i < daftarBarang.length; i++) {
    const barang = daftarBarang[i];
    const cocokNama = nama === "" || barang.nama.toLowerCase().includes(nama);
    const cocokKategori =
      kategori === "" || barang.kategori.toLowerCase() === kategori;
    if (cocokNama && cocokKategori) {
      hasil.push(tampilkanBarang(barang));
    }
  }

  if (hasil.length === 0) {
    return res.status(404).json({ pesan: "Barang tidak ditemukan" });
  }
  res.json(hasil);
});

// Menampilkan satu barang berdasarkan id
app.get("/barang/:id", (req, res) => {
  const indeks = cariIndeks(Number(req.params.id));
  if (indeks === -1) {
    return res.status(404).json({ pesan: "Barang tidak ditemukan" });
  }
  res.json(tampilkanBarang(daftarBarang[indeks]));
});

// MENAMBAHKAN barang baru
app.post("/barang", (req, res) => {
  const data = req.body;

  if (!data || !data.nama || !data.kategori) {
    return res.status(400).json({ pesan: "nama dan kategori wajib diisi" });
  }
  if (typeof data.harga !== "number" || data.harga <= 0) {
    return res
      .status(400)
      .json({ pesan: "harga harus berupa angka lebih dari 0" });
  }
  if (typeof data.stok !== "number" || data.stok < 0) {
    return res
      .status(400)
      .json({ pesan: "stok harus berupa angka 0 atau lebih" });
  }

  const barangBaru = {
    id: idBerikutnya,
    nama: data.nama,
    kategori: data.kategori,
    harga: data.harga,
    stok: data.stok,
  };
  idBerikutnya++;
  daftarBarang.push(barangBaru);

  res.status(201).json({
    pesan: "Barang berhasil ditambahkan",
    data: tampilkanBarang(barangBaru),
  });
});

// MENGUBAH barang (cukup kirim field yang ingin diubah)
app.put("/barang/:id", (req, res) => {
  const indeks = cariIndeks(Number(req.params.id));
  if (indeks === -1) {
    return res.status(404).json({ pesan: "Barang tidak ditemukan" });
  }

  const data = req.body || {};
  const barang = daftarBarang[indeks];

  if (data.nama !== undefined) {
    barang.nama = data.nama;
  }
  if (data.kategori !== undefined) {
    barang.kategori = data.kategori;
  }
  if (data.harga !== undefined) {
    if (typeof data.harga !== "number" || data.harga <= 0) {
      return res
        .status(400)
        .json({ pesan: "harga harus berupa angka lebih dari 0" });
    }
    barang.harga = data.harga;
  }
  if (data.stok !== undefined) {
    if (typeof data.stok !== "number" || data.stok < 0) {
      return res
        .status(400)
        .json({ pesan: "stok harus berupa angka 0 atau lebih" });
    }
    barang.stok = data.stok;
  }

  res.json({ pesan: "Barang berhasil diubah", data: tampilkanBarang(barang) });
});

// MENGHAPUS barang
app.delete("/barang/:id", (req, res) => {
  const indeks = cariIndeks(Number(req.params.id));
  if (indeks === -1) {
    return res.status(404).json({ pesan: "Barang tidak ditemukan" });
  }

  const dihapus = daftarBarang.splice(indeks, 1); // buang 1 data di posisi indeks
  res.json({ pesan: "Barang berhasil dihapus", data: dihapus[0] });
});

app.listen(3000, () =>
  console.log("Server lagi jalan di http://localhost:3000"),
);
