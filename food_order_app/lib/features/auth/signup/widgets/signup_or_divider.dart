import 'package:flutter/material.dart';
import 'package:flutter_localization/flutter_localization.dart';

/// Divider with "or register with" text for SignUp.
class SignUpOrDivider extends StatelessWidget {
  const SignUpOrDivider({super.key});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(child: Container(height: 1, color: Colors.grey.shade200)),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14),
          child: Text(
            'orRegisterWith'.getString(context),
            style: TextStyle(
              color: Colors.grey.shade500,
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
        Expanded(child: Container(height: 1, color: Colors.grey.shade200)),
      ],
    );
  }
}
