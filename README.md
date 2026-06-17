# WhatsApp Baileys

<p align="center">
  <img src="https://files.catbox.moe/0sk43i.jpg" alt="Thumbnail" />
</p>

Library open-source yang dirancang untuk membangun integrasi dan otomasi WhatsApp secara langsung via websocket — tanpa browser, tanpa overhead. Cocok untuk bot bisnis, sistem customer service, hingga otomasi komunikasi skala besar.

---

## Apa yang Bisa Dilakukan?

Baileys hadir dengan dukungan fitur lengkap yang terus berkembang:

- Proses pairing kustom yang stabil dan bisa dikonfigurasi sendiri
- Perbaikan masalah autentikasi yang sering gagal di versi sebelumnya
- Pesan interaktif dengan tombol aksi dan menu dinamis
- Manajemen sesi otomatis yang efisien untuk operasi jangka panjang
- Kompatibel dengan fitur multi-device terbaru WhatsApp
- Ringan, modular, dan mudah diintegrasikan ke berbagai sistem
- Cocok untuk bot, automasi, hingga solusi komunikasi enterprise

---

## Mulai Pakai

Install lewat package manager pilihan kamu, ikuti panduan konfigurasi, dan manfaatkan contoh kode yang sudah disediakan. Kombinasikan session storage dengan fitur pesan interaktif untuk membangun solusi yang solid dan siap production.

---

## Fungsi Tambahan

### Cek ID Channel
```javascript
await sock.newsletterId(url)
```

### Cek Status Nomor
```javascript
await sock.checkWhatsApp(jid)
```

---

## Referensi SendMessage

### Status Grup V2
```javascript
await sock.sendMessage(jid, {
     groupStatusMessage: {
          text: "Hello World"
     }
});
```

### Album (Banyak Gambar Sekaligus)
```javascript
await sock.sendMessage(jid, { 
    albumMessage: [
        { image: cihuy, caption: "Foto pertama" },
        { image: { url: "URL IMAGE" }, caption: "Foto kedua" }
    ] 
}, { quoted: m });
```

### Pesan Event / Undangan
```javascript
await sock.sendMessage(jid, { 
    eventMessage: { 
        isCanceled: false, 
        name: "Hello World", 
        description: "flutterbybttr", 
        location: { 
            degreesLatitude: 0, 
            degreesLongitude: 0, 
            name: "rowrrrr" 
        }, 
        joinLink: "https://call.whatsapp.com/video/flutterbybttr", 
        startTime: "1763019000", 
        endTime: "1763026200", 
        extraGuestsAllowed: false 
    } 
}, { quoted: m });
```

### Hasil Polling
```javascript
await sock.sendMessage(jid, { 
    pollResultMessage: { 
        name: "Hello World", 
        pollVotes: [
            {
                optionName: "TEST 1",
                optionVoteCount: "112233"
            },
            {
                optionName: "TEST 2",
                optionVoteCount: "1"
            }
        ] 
    } 
}, { quoted: m });
```

### Pesan Interaktif Sederhana
```javascript
await sock.sendMessage(jid, {
    interactiveMessage: {
        header: "Hello World",
        title: "Hello World",
        footer: "telegram: @flutterbybttr ",
        buttons: [
            {
                name: "cta_copy",
                buttonParamsJson: JSON.stringify({
                    display_text: "copy code",
                    id: "123456789",              
                    copy_code: "ABC123XYZ"
                })
            }
        ]
    }
}, { quoted: m });
```

### Interaktif dengan Native Flow
```javascript
await sock.sendMessage(jid, {    
    interactiveMessage: {      
        header: "Hello World",
        title: "Hello World",      
        footer: "telegram: @flutterbybttr",      
        image: { url: "https://example.com/image.jpg" },      
        nativeFlowMessage: {        
            messageParamsJson: JSON.stringify({          
                limited_time_offer: {            
                    text: "idk hummmm?",            
                    url: "https://t.me/flutterbybttr",            
                    copy_code: "viaa",            
                    expiration_time: Date.now() * 999          
                },          
                bottom_sheet: {            
                    in_thread_buttons_limit: 2,            
                    divider_indices: [1, 2, 3, 4, 5, 999],            
                    list_title: "viaa",            
                    button_title: "viaa"          
                },          
                tap_target_configuration: {            
                    title: " X ",            
                    description: "bomboclard",            
                    canonical_url: "https://t.me/flutterbybttr",            
                    domain: "shop.example.com",            
                    button_index: 0          
                }        
            }),        
            buttons: [          
                {            
                    name: "single_select",            
                    buttonParamsJson: JSON.stringify({              
                        has_multiple_buttons: true            
                    })          
                },          
                {            
                    name: "call_permission_request",            
                    buttonParamsJson: JSON.stringify({              
                        has_multiple_buttons: true            
                    })          
                },          
                {            
                    name: "single_select",            
                    buttonParamsJson: JSON.stringify({              
                        title: "Hello World",              
                        sections: [                
                            {                  
                                title: "title",                  
                                highlight_label: "label",                  
                                rows: [                    
                                    {                      
                                        title: "@flutterbybttr",                      
                                        description: "i loved you viaa",                      
                                        id: "row_2"                    
                                    }                  
                                ]                
                            }              
                        ],              
                        has_multiple_buttons: true            
                    })          
                },          
                {            
                    name: "cta_copy",            
                    buttonParamsJson: JSON.stringify({              
                        display_text: "copy code",              
                        id: "123456789",              
                        copy_code: "ABC123XYZ"            
                    })          
                }        
            ]      
        }    
    }  
}, { quoted: m });
```

### Interaktif dengan Thumbnail
```javascript
await sock.sendMessage(jid, {
    interactiveMessage: {
        header: "Hello World",
        title: "Hello World",
        footer: "telegram: @flutterbybttr",
        image: { url: "https://example.com/image.jpg" },
        buttons: [
            {
                name: "cta_copy",
                buttonParamsJson: JSON.stringify({
                    display_text: "copy code",
                    id: "123456789",
                    copy_code: "ABC123XYZ"
                })
            }
        ]
    }
}, { quoted: m });
```

### Pesan Produk
```javascript
await sock.sendMessage(jid, {
    productMessage: {
        title: "Produk Contoh",
        description: "Ini adalah deskripsi produk",
        thumbnail: { url: "https://example.com/image.jpg" },
        productId: "PROD001",
        retailerId: "RETAIL001",
        url: "https://example.com/product",
        body: "Detail produk",
        footer: "Harga spesial",
        priceAmount1000: 50000,
        currencyCode: "USD",
        buttons: [
            {
                name: "cta_url",
                buttonParamsJson: JSON.stringify({
                    display_text: "Beli Sekarang",
                    url: "https://example.com/buy"
                })
            }
        ]
    }
}, { quoted: m });
```

### Interaktif + Dokumen dari Buffer
> **Catatan:** Dokumen hanya mendukung buffer, bukan URL langsung.

```javascript
await sock.sendMessage(jid, {
    interactiveMessage: {
        header: "Hello World",
        title: "Hello World",
        footer: "telegram: @flutterbybttr",
        document: fs.readFileSync("./package.json"),
        mimetype: "application/pdf",
        fileName: "flutterbybttr.pdf",
        jpegThumbnail: fs.readFileSync("./document.jpeg"),
        contextInfo: {
            mentionedJid: [jid],
            forwardingScore: 777,
            isForwarded: false
        },
        externalAdReply: {
            title: "SkyWings Bots",
            body: "PhoenixVisions",
            mediaType: 3,
            thumbnailUrl: "https://example.com/image.jpg",
            mediaUrl: " X ",
            sourceUrl: "https://t.me/flutterbybttr",
            showAdAttribution: true,
            renderLargerThumbnail: false         
        },
        buttons: [
            {
                name: "cta_url",
                buttonParamsJson: JSON.stringify({
                    display_text: "Telegram",
                    url: "https://t.me/flutterbybttr",
                    merchant_url: "https://t.me/flutterbybttr"
                })
            }
        ]
    }
}, { quoted: m });
```

### Interaktif + Dokumen dari Buffer (Versi Simpel)
> **Catatan:** Dokumen hanya mendukung buffer, bukan URL langsung.

```javascript
await sock.sendMessage(jid, {
    interactiveMessage: {
        header: "Hello World",
        title: "Hello World",
        footer: "telegram: @flutterbybttr",
        document: fs.readFileSync("./package.json"),
        mimetype: "application/pdf",
        fileName: "flutterbybttr.pdf",
        jpegThumbnail: fs.readFileSync("./document.jpeg"),
        buttons: [
            {
                name: "cta_url",
                buttonParamsJson: JSON.stringify({
                    display_text: "Telegram",
                    url: "https://t.me/flutterbybttr",
                    merchant_url: "https://t.me/flutterbybttr"
                })
            }
        ]
    }
}, { quoted: m });
```

### Request Pembayaran
```javascript
let quotedType = m.quoted?.mtype || '';
let quotedContent = JSON.stringify({ [quotedType]: m.quoted }, null, 2);

await sock.sendMessage(jid, {
    requestPaymentMessage: {
        currency: "IDR",
        amount: 10000000,
        from: m.sender,
        sticker: JSON.parse(quotedContent),
        background: {
            id: "100",
            fileLength: "0",
            width: 1000,
            height: 1000,
            mimetype: "image/webp",
            placeholderArgb: 0xFF00FFFF,
            textArgb: 0xFFFFFFFF,     
            subtextArgb: 0xFFAA00FF   
        }
    }
}, { quoted: m });
```

---

## Catatan Teknis

- Pairing code kustom yang stabil dan tidak mudah putus
- Perbaikan bug autentikasi dari versi-versi sebelumnya
- Mendukung pesan interaktif, tombol aksi, dan menu dinamis
- Sesi dikelola secara otomatis untuk stabilitas jangka panjang
- Full support fitur multi-device WhatsApp terbaru
- Mudah dikustomisasi sesuai kebutuhan project
- Ideal untuk bot, customer service otomatis, dan aplikasi komunikasi lainnya

---

Dokumentasi lengkap, panduan instalasi, dan contoh implementasi tersedia di repositori resmi. Library ini terus diperbarui mengikuti perkembangan platform WhatsApp.

**Terima kasih sudah menggunakan WhatsApp Baileys!**
