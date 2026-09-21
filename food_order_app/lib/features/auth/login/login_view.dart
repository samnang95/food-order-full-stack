import 'package:flutter/material.dart';
import 'package:get/get.dart';

import 'login_store.dart';
import 'widgets/widgets.dart';

class LoginView extends GetView<LoginStore> {
  const LoginView({super.key});

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
            stops: [0.0, 0.45],
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
                        // Top Bar: Badge & Language Switcher
                        const LoginTopBar(),
                        
                        const SizedBox(height: 28),
                        
                        // Hero Logo & Greeting
                        const LoginHeroHeader(),
                        
                        const SizedBox(height: 24),
                        
                        // Promotional Tag
                        const LoginPromoBadge(),
                        
                        const SizedBox(height: 24),
                        
                        // Error Alert Banner (Reactive)
                        LoginErrorBanner(controller: controller),
                        
                        // Form Fields Card
                        const LoginFormCard(),
                        
                        const SizedBox(height: 24),
                        
                        // Divider
                        const LoginOrDivider(),
                        
                        const SizedBox(height: 20),
                        
                        // Social Logins (Google & Apple)
                        LoginSocialButtons(controller: controller),
                        
                        const Spacer(),
                        const SizedBox(height: 28),
                        
                        // Sign Up Link & Security Badge
                        const LoginFooter(),
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
