# 🚀 Cara Start & Scan QR Code

## Step 1: Stop Server Yang Running

Tekan **Ctrl + C** dalam terminal PowerShell anda

## Step 2: Start Semula

```bash
cd D:\Downloads\Al-Quran-Mobile-Merged
npm start
```

## Step 3: Tunggu QR Code Keluar

Dalam beberapa saat, akan nampak:

```
▄▄▄▄▄▄▄ ▄▄  ▄ ▄▄▄   ▄▄▄▄▄▄▄
█ ▄▄▄ █ ██▄  █ ▄ █ █ █ ▄▄▄ █
█ ███ █ █▄█ ▀█▀ █▀█ █ ███ █
█▄▄▄▄▄█ █▀▄ ▄▀█ ▄ █ █▄▄▄▄▄█
```

## Step 4: Scan Dengan Phone

### Android:
1. Install **Expo Go** dari Play Store
2. Buka app
3. Tap **Scan QR Code**
4. Scan QR code dari PC

### iPhone:
1. Install **Expo Go** dari App Store
2. Buka app
3. Tap **Scan QR Code** 
4. Scan QR code dari PC

## Cara Alternatif (Tanpa QR)

### Sambung Manual:

1. Pastikan phone & PC sama WiFi
2. Buka Expo Go
3. Tap **Enter URL manually**
4. Masukkan: `exp://192.168.0.3:8081`
5. Tap Connect

## Kalau Tak Boleh Connect:

### Check WiFi:
- PC dan phone MESTI sama network
- Jangan guna WiFi public/office (ada firewall)

### Check Firewall:
```bash
# Buka port 8081 di Windows Firewall
# Control Panel > Windows Firewall > Allow App
```

### Guna Tunnel Mode:
```bash
npm start -- --tunnel
```
Akan dapat URL macam: `exp://abc-123.exp.direct:80/--/`

---

## 🔥 Quick Start Command

```bash
cd D:\Downloads\Al-Quran-Mobile-Merged
npm start
```

Tunggu QR code keluar, then scan! 📱

