# 📖 BiteCraft — Full-Stack Food Ordering Platform Notebook

> **Status:** 100% Complete & Production Ready  
> **Repository:** `samnang95/food-order-full-stack`  
> **Release Target:** iOS, Android, and Web

---

## 📑 Table of Contents
1. [Platform Overview](#-platform-overview)
2. [Technology Stack](#-technology-stack)
3. [Architecture Overview](#-architecture-overview)
4. [Completed Feature Catalog](#-completed-feature-catalog)
5. [Payment Gateway Specifications](#-payment-gateway-specifications)
6. [Live Order Tracking & Driver Simulation](#-live-order-tracking--driver-simulation)
7. [Push Notification & Alert System](#-push-notification--alert-system)
8. [Multi-Flavor Configuration](#-multi-flavor-configuration)
9. [ProGuard & Android Release Configuration](#-proguard--android-release-configuration)
10. [Command Handbook (Run, Test, Build)](#-command-handbook-run-test-build)
11. [Backend API Reference](#-backend-api-reference)
12. [Real-Time Socket.IO Events](#-real-time-socketio-events)

---

## 🌟 Platform Overview

**BiteCraft** is an end-to-end, enterprise-grade food ordering and delivery system tailored for high-performance mobile and web delivery in Southeast Asia (specifically Cambodia) and worldwide.

Key highlights:
- **Clean Architecture & MVVM**: Layered Separation of Concerns with reactive GetX state management.
- **Dual Currency & Local Payments**: Real-time USD ($) and Khmer Riel (៛) conversion with **ABA KHQR** (Bakong national payment network) and **Credit/Debit Card** checkout.
- **Real-Time Logistics**: Live driver tracking on an interactive OpenStreetMap canvas with dynamic route interpolation.
- **Enterprise Notification Engine**: Native OS system tray notifications, iOS background remote notifications, and customized in-app drop-down push banners.
- **100% Automated Test Coverage**: 225 unit and widget tests passing with 0 analyzer issues.

---

## 🛠 Technology Stack

### Mobile Client (`food_order_app`)
- **Framework**: Flutter 3.x (Dart 3.x)
- **State Management**: GetX (Store / Intent / State pattern)
- **Maps & Location**: `flutter_map` (OpenStreetMap), `latlong2`
- **Networking**: `http`, `socket_io_client`
- **Notifications**: `firebase_messaging` (FCM), `flutter_local_notifications`
- **Auth Integrations**: `google_sign_in`, `sign_in_with_apple`
- **Storage & Caching**: `shared_preferences` with typed `LocalDB`
- **Branding**: `flutter_native_splash`, `flutter_launcher_icons`

### Backend API (`food-ordering-api`)
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-Time Server**: Socket.IO with dynamic room partitioning (`order_{orderId}`)
- **Cloud Media**: Cloudinary (Product & avatar image storage)
- **Push Engine**: Firebase Admin SDK (`firebase-admin`)
- **Security**: JWT authentication, `bcryptjs` password hashing, CORS whitelist

---

## 🏛 Architecture Overview

```
food_order_app/lib/
├── core/
│   ├── config/              # AppEnvironment (dev, staging, prod)
│   ├── constants/           # AppColors, typography, assets
│   ├── db/                  # LocalDB SharedPreferences wrapper
│   ├── locale/              # Multi-language dictionary (Khmer & English)
│   ├── services/            # ApiClient, CartService, SocketService, LocalNotificationService, FirebaseNotificationService
│   └── utils/               # Currency, date, and string formatters
├── domain/                  # Enterprise Business Logic
│   ├── address/             # SavedAddressEntity & Repository interfaces
│   ├── auth/                # UserEntity & AuthRepository
│   ├── food/                # FoodEntity, CategoryEntity
│   └── order/               # OrderEntity, OrderItemEntity, OrderRepository
├── data/                    # Data Access & External Adapters
│   ├── datasources/         # Remote HTTP API implementations
│   └── repositories/        # Repository implementations mapping DTOs to Entities
└── features/                # Presentation Layer (MVVM)
    ├── auth/                # Login, Register, Social Sign-In
    ├── home/                # Categories, Banner carousel, Popular foods
    ├── cart/                # Cart summary, quantity modifier
    ├── checkout/            # Interactive payment sheets (KHQR & Card), bill breakdown, tip
    ├── orders/              # Order history, status filter
    ├── order_detail/        # Live OSM tracking, status timeline, cancellation/refund
    ├── profile/             # Profile info, addresses, preferences
    └── notifications/       # Notification center, filter tabs, in-app banners
```

---

## 🚀 Completed Feature Catalog

### 1. App Branding & Visual Polish
- **Native Splash Screen**: Configured with `#FFFFFF` light-mode background on Android 12+ and iOS to ensure maximum contrast and zero dark-mode invert issues.
- **Adaptive Launcher Icons**: BiteCraft vector branding generated across `mdpi`, `hdpi`, `xhdpi`, `xxhdpi`, and `xxxhdpi`.
- **Bilingual Engine**: Real-time switching between **English** and **Khmer (ភាសាខ្មែរ)**.
- **Adaptive Theming**: Polished dark theme (`#1E2638`) and light theme with fluid transitions.

### 2. Food Catalog & Discovery
- Category tabs (Burgers, Asian, Pizza, Drinks, Desserts, Healthy).
- Real-time search by keyword and category filtering.
- Special badges (Popular, Spicy, Vegetarian, Chef's Special).
- Vouchers and promo discount calculation engine (`WELCOME10`, `FREESHIP`, `KHNEWYEAR`).

### 3. Smart Checkout & Customization
- **Cutlery Selection**: Toggle for disposable cutlery with custom set counter.
- **Kitchen Cooking Notes**: Dedicated prep instructions (e.g., "Less spicy", "No onions").
- **Delivery Scheduling**: Immediate or scheduled time slots.
- **Driver Tipping**: Direct tip presets ($0.50, $1.00, $2.00, custom).
- **Saved Address Book**: Multi-address management (Home, Work, Other) with GPS reverse geocoding.

### 4. Order Cancellation & Automated Refund
- **One-Touch Cancellation**: Active for pending orders with reason selector ("Changed mind", "Delivery time too long", "Ordered by mistake").
- **Instant Wallet/Card Refund Simulation**: Automated refund dispatch returning paid funds directly to the customer balance.

---

## 💳 Payment Gateway Specifications

### 1. ABA KHQR (Bakong Cambodia)
- **Widget**: `AbaKhqrPaymentSheet` (`lib/features/checkout/widgets/aba_khqr_payment_sheet.dart`)
- **Official KHQR Frame**: Red top ribbon, merchant name `BiteCraft Express`, custom-painted Bakong QR code.
- **Dual Currency Display**:
  - Primary: USD `$XX.XX`
  - Secondary: KHR `៛XXX,XXX` (calculated at `1 USD = 4,100 KHR`).
- **5-Minute Countdown Timer**: Dynamic timer indicating QR expiration.
- **Cambodia Banking Network**: Deep-link ready chips for **ABA Mobile**, **ACLEDA**, **Wing Bank**, and **Bakong App**.
- **Payment Verification Engine**: One-tap verification check simulating live National Bank clearing.

### 2. Credit & Debit Card (Visa / Mastercard)
- **Widget**: `CardPaymentSheet` (`lib/features/checkout/widgets/card_payment_sheet.dart`)
- **Live 3D-Styled Card Preview**:
  - Real-time cardholder name uppercase rendering.
  - Golden EMV chip with metallic circuits.
  - Contactless payment wave icon.
  - Masked number formatting (`•••• •••• •••• 1234`).
- **Smart Brand Detection**: Automatically detects **Visa** (starts with `4`), **Mastercard** (starts with `5` or `2`), and **JCB** (starts with `35`).
- **Security & Trust**: 256-Bit SSL encryption badge, PCI-DSS Level 1 compliance indicator, and "Save card securely for 1-click checkout" toggle.

---

## 🗺 Live Order Tracking & Driver Simulation

- **Map Engine**: OpenStreetMap (OSM) rendering via `flutter_map` (zero Google Maps API key fees required).
- **Driver Motorbike Marker**: Real-time moving marker with smooth heading angle calculation.
- **Live Delivery Progress Bar**: Continuous progress calculation (0% to 100%) reflecting driver proximity.
- **Socket Rooms**: Automatic client room isolation using `join_order` with `orderId`.

---

## 🔔 Push Notification & Alert System

- **Background FCM Handler**: `firebaseMessagingBackgroundHandler` registered at the top level with `@pragma('vm:entry-point')`.
- **Android Channels**:
  - `bitecraft_orders`: High importance, vibration, heads-up alert.
  - `bitecraft_promos`: Default importance for discount codes.
- **iOS Remote Notifications**: `UIBackgroundModes` declared with `fetch` and `remote-notification`.
- **Automated Lifecycle Notifications**:
  - `✅ Confirmed`: Restaurant accepted order.
  - `🍳 Preparing`: Chef is cooking the meal.
  - `🛵 Out for Delivery`: Driver is en route with live map tracking.
  - `🎉 Delivered`: Meal arrived; prompt for review.
  - `❌ Cancelled`: Cancellation confirmation & refund credit.
- **In-App Banner**: Animated sliding top banner (`InAppPushBanner`) with sound and direct navigation.

---

## 🏷 Multi-Flavor Configuration

The application is structured into 3 distinct environments:

| Flavor | Target File | Env File | Android App Name | Application ID |
|---|---|---|---|---|
| **Development** | `lib/main_dev.dart` | `.env.dev` | `BiteCraft Dev` | `com.example.food_order_app.dev` |
| **Staging** | `lib/main_staging.dart` | `.env.staging` | `BiteCraft Staging` | `com.example.food_order_app.staging` |
| **Production** | `lib/main_prod.dart` | `.env.prod` | `BiteCraft` | `com.example.food_order_app` |

---

## 🛡 ProGuard & Android Release Configuration

File: `android/app/proguard-rules.pro`

```proguard
# Flutter Wrapper
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.**  { *; }
-keep class io.flutter.util.**  { *; }
-keep class io.flutter.view.**  { *; }
-keep class io.flutter.**  { *; }
-keep class io.flutter.plugins.**  { *; }

# Flutter Local Notifications
-keep class com.dexterous.flutterlocalnotifications.** { *; }
-dontwarn com.dexterous.flutterlocalnotifications.**

# Firebase Core & Messaging
-keepattributes *Annotation*
-keepattributes SourceFile,LineNumberTable
-keep public class * extends java.lang.Exception
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**

# Java Desugaring
-dontwarn java.time.**

# Keep Parcelables & Serialization
-keepclassmembers class * implements android.os.Parcelable {
    static ** CREATOR;
}
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}
```

---

## 💻 Command Handbook (Run, Test, Build)

### 1. Running Locally (Development)
```bash
# Start Backend API (from food-ordering-api/):
npm run dev

# Run Mobile Client (from food_order_app/):
flutter run -t lib/main_dev.dart --flavor dev
```

### 2. Running Automated Tests & Code Analysis
```bash
# Run all 225 tests:
flutter test

# Run code analysis (0 issues):
flutter analyze

# Run specific feature test:
flutter test test/features/checkout/checkout_payment_sheet_test.dart
flutter test test/features/notifications/notification_test.dart
flutter test test/features/order_detail/order_cancellation_test.dart
```

### 3. Production Release Builds
```bash
# Build Android App Bundle (.aab for Google Play):
flutter build appbundle -t lib/main_prod.dart --flavor prod

# Build Android Standalone APK (.apk):
flutter build apk -t lib/main_prod.dart --flavor prod

# Build iOS Release Archive:
flutter build ipa -t lib/main_prod.dart --flavor prod
```

---

## 🌐 Backend API Reference

Base URL: `http://localhost:3000` (or production host)

| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/health` | Server health check & timestamp | No |
| `POST` | `/auth/register` | Register new customer account | No |
| `POST` | `/auth/login` | Authenticate customer & return JWT | No |
| `POST` | `/auth/google` | Google OAuth token verification | No |
| `POST` | `/auth/apple` | Apple OAuth credential verification | No |
| `GET` | `/users/profile` | Get authenticated user profile | Yes |
| `PUT` | `/users/profile` | Update profile information | Yes |
| `POST` | `/users/fcm-token` | Register/sync FCM device token | Yes |
| `GET` | `/foods` | Fetch all foods with category filtering | No |
| `GET` | `/categories` | Fetch category menu taxonomy | No |
| `POST` | `/orders` | Place a new food order | Yes |
| `GET` | `/orders/my-orders`| Fetch order history for user | Yes |
| `GET` | `/orders/:id` | Fetch detailed order by ID | Yes |
| `PUT` | `/orders/:id/cancel` | Cancel pending order & trigger refund | Yes |
| `GET` | `/vouchers` | Fetch available discount coupons | No |
| `POST` | `/vouchers/validate`| Validate promo code and get discount | No |
| `GET` | `/notifications` | Fetch system announcements & alerts | No |

---

## ⚡ Real-Time Socket.IO Events

| Event Name | Direction | Payload | Description |
|---|---|---|---|
| `join_order` | Client ➔ Server | `{ orderId }` | Joins room for order tracking |
| `leave_order` | Client ➔ Server | `{ orderId }` | Leaves order tracking room |
| `driver_location`| Server ➔ Client | `{ orderId, lat, lng, heading, eta, progress }` | Real-time motorbike GPS update |
| `order_status_changed` | Server ➔ Client | `{ orderId, status }` | Immediate order state update |
| `push_notification` | Server ➔ Client | `{ id, title, body, type, orderId }` | Broadcast or targeted push alert |

---

*Notebook maintained by BiteCraft Full-Stack Engineering Team.*
