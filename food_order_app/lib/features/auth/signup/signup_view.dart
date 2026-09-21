import 'package:flutter/material.dart';
import 'package:get/get.dart';

import 'signup_store.dart';
import 'widgets/widgets.dart';

class SignUpView extends GetView<SignUpStore> {
  const SignUpView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Color(0xFFFFF7ED), // Soft warm peach
              Color(0xFFF8FAFC), // Clean neutral
            ],
            stops: [0.0, 0.40],
          ),
        ),
        child: SafeArea(
          child: LayoutBuilder(
            builder: (context, constraints) {
              return SingleChildScrollView(
                keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
                padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
                child: ConstrainedBox(
                  constraints: BoxConstraints(minHeight: constraints.maxHeight - 32),
                  child: IntrinsicHeight(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // Top Bar: Back button, brand pill & language switcher
                        const SignUpTopBar(),

                        const SizedBox(height: 22),

                        // Hero Logo & Title
                        const SignUpHeroHeader(),

                        const SizedBox(height: 18),

                        // Promotional perk banner
                        const SignUpPromoBadge(),

                        const SizedBox(height: 20),

                        // Reactive Error Banner
                        SignUpErrorBanner(controller: controller),

                        // Form Card: Username, Email, Password, Confirm Password, Terms, CTA
                        SignUpFormCard(controller: controller),

                        const SizedBox(height: 24),

                        // "or register with" Divider
                        const SignUpOrDivider(),

                        const SizedBox(height: 20),

                        // Social Logins (Google & Apple)
                        SignUpSocialButtons(controller: controller),

                        const Spacer(),
                        const SizedBox(height: 24),

                        // Sign In navigation link & SSL Security Badge
                        const SignUpFooter(),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}
