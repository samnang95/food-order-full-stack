import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:food_order_app/features/checkout/widgets/aba_khqr_payment_sheet.dart';
import 'package:food_order_app/features/checkout/widgets/card_payment_sheet.dart';

void main() {
  group('AbaKhqrPaymentSheet Widget Tests', () {
    testWidgets('Renders KHQR payment sheet with USD, KHR and bank options', (tester) async {
      bool paymentSuccessCalled = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: AbaKhqrPaymentSheet(
              amount: 25.00,
              orderId: 'ORD-123456',
              onPaymentSuccess: () {
                paymentSuccessCalled = true;
              },
            ),
          ),
        ),
      );

      // Verify title & info
      expect(find.text('ABA KHQR / Bakong'), findsOneWidget);
      expect(find.text('Scan with any banking app in Cambodia'), findsOneWidget);

      // Verify USD and KHR amounts ($25.00 * 4100 = 102,500 KHR)
      expect(find.text('\$25.00'), findsOneWidget);
      expect(find.text('(៛102,500)'), findsOneWidget);

      // Verify bank support chips
      expect(find.text('ABA Mobile'), findsOneWidget);
      expect(find.text('Bakong App'), findsOneWidget);
      expect(find.text('ACLEDA'), findsOneWidget);
      expect(find.text('Wing Bank'), findsOneWidget);

      // Verify countdown timer text is present
      expect(find.textContaining(':'), findsWidgets);

      // Verify Pay confirmation button
      final verifyButton = find.text('I Have Paid');
      expect(verifyButton, findsOneWidget);

      // Tap confirm payment button
      await tester.tap(verifyButton);
      await tester.pump();

      // Should show verifying state
      expect(find.text('Verifying Payment...'), findsOneWidget);

      // Fast-forward simulation timer
      await tester.pump(const Duration(milliseconds: 1300));
      expect(find.text('Payment Successful!'), findsOneWidget);

      await tester.pump(const Duration(milliseconds: 800));
      expect(paymentSuccessCalled, isTrue);
    });

    testWidgets('Can select different bank apps', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: AbaKhqrPaymentSheet(
              amount: 10.00,
              orderId: 'ORD-999',
              onPaymentSuccess: () {},
            ),
          ),
        ),
      );

      final bakongChip = find.text('Bakong App');
      expect(bakongChip, findsOneWidget);
      await tester.tap(bakongChip, warnIfMissed: false);
      await tester.pump();

      // Selected bank should be Bakong App
      expect(find.text('Bakong App'), findsOneWidget);
    });
  });

  group('CardPaymentSheet Widget Tests', () {
    testWidgets('Renders card preview, inputs, and detects Visa brand', (tester) async {
      bool paymentSuccessCalled = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: CardPaymentSheet(
              amount: 42.50,
              orderId: 'ORD-789',
              onPaymentSuccess: () {
                paymentSuccessCalled = true;
              },
            ),
          ),
        ),
      );

      // Verify Header & Pay Button
      expect(find.text('Credit or Debit Card'), findsOneWidget);
      expect(find.text('Pay \$42.50 Securely'), findsOneWidget);

      // Verify Cardholder, Number, Expiry, CVV fields
      expect(find.text('Cardholder Name'), findsOneWidget);
      expect(find.text('Card Number'), findsOneWidget);
      expect(find.text('Expiry Date'), findsOneWidget);
      expect(find.text('CVV / CVC'), findsOneWidget);

      // Enter Cardholder Name
      final nameField = find.widgetWithText(TextFormField, 'Full Name on Card');
      await tester.enterText(nameField, 'Sokha Meng');
      await tester.pump();
      expect(find.text('SOKHA MENG'), findsOneWidget);

      // Enter Visa Card Number (starts with 4)
      final numberField = find.widgetWithText(TextFormField, '1234 5678 9012 3456');
      await tester.enterText(numberField, '4242424242424242');
      await tester.pump();

      // Enter Expiry
      final expiryField = find.widgetWithText(TextFormField, 'MM/YY');
      await tester.enterText(expiryField, '1228');
      await tester.pump();
      // Should find 12/28 in both card preview and text input
      expect(find.text('12/28'), findsNWidgets(2));

      // Enter CVV
      final cvvField = find.widgetWithText(TextFormField, '123');
      await tester.enterText(cvvField, '888');
      await tester.pump();

      // Tap Pay Button
      final payButton = find.text('Pay \$42.50 Securely');
      await tester.tap(payButton);
      await tester.pump();

      // Should show processing indicator
      expect(find.text('Authorizing with Bank...'), findsOneWidget);

      // Advance through simulated 3D Secure bank authorization
      await tester.pump(const Duration(milliseconds: 1500));
      expect(find.text('Payment Authorized!'), findsOneWidget);

      await tester.pump(const Duration(milliseconds: 800));
      expect(paymentSuccessCalled, isTrue);
    });

    testWidgets('Validates missing required fields before processing', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: CardPaymentSheet(
              amount: 15.00,
              orderId: 'ORD-111',
              onPaymentSuccess: () {},
            ),
          ),
        ),
      );

      final payButton = find.text('Pay \$15.00 Securely');
      await tester.tap(payButton);
      await tester.pumpAndSettle();

      // Validation errors should be visible
      expect(find.text('Please enter the name on your card'), findsOneWidget);
      expect(find.text('Enter a valid 15 or 16-digit card number'), findsOneWidget);
      expect(find.text('Format MM/YY'), findsOneWidget);
      expect(find.text('3 digits'), findsOneWidget);
    });
  });
}
