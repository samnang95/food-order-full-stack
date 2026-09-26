import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/locale/translation_helper.dart';
import '../checkout_intent.dart';
import '../checkout_store.dart';

class CheckoutPreferencesCard extends StatefulWidget {
  const CheckoutPreferencesCard({super.key});

  @override
  State<CheckoutPreferencesCard> createState() => _CheckoutPreferencesCardState();
}

class _CheckoutPreferencesCardState extends State<CheckoutPreferencesCard> {
  final CheckoutStore controller = Get.find<CheckoutStore>();
  late final TextEditingController _kitchenNoteController;
  Worker? _kitchenWorker;

  static const List<String> _quickPreferences = [
    '🌶️ Less Spicy',
    '🧅 No Onions',
    '🥢 Separate Sauce',
    '🧊 Extra Ice',
    '🌿 Vegetarian Prep',
    '🧂 Less Salt',
  ];

  static const List<String> _availableCondiments = [
    '🌶️ Chili Sauce',
    '🍅 Tomato Ketchup',
    '🥢 Chopsticks',
    '🧻 Extra Napkins',
    '🍋 Lime & Pepper',
  ];

  @override
  void initState() {
    super.initState();
    _kitchenNoteController = TextEditingController(text: controller.state.value.kitchenNote);
    _kitchenWorker = ever(controller.state, (state) {
      if (_kitchenNoteController.text != state.kitchenNote) {
        _kitchenNoteController.text = state.kitchenNote;
      }
    });
  }

  @override
  void dispose() {
    _kitchenWorker?.dispose();
    _kitchenNoteController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? const Color(0xFF1E2638) : Colors.white;
    final borderColor = isDark ? const Color(0xFF2E3A52) : AppColors.borderColor;
    final subCardBg = isDark ? const Color(0xFF141A29) : const Color(0xFFF8FAFC);

    return Obx(() {
      final state = controller.state.value;
      final requestCutlery = state.requestCutlery;
      final cutleryCount = state.cutleryCount;
      final selectedPrefs = state.kitchenPreferences;
      final selectedCondiments = state.selectedCondiments;

      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: cardBg,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: borderColor),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: isDark ? 0.25 : 0.04),
              blurRadius: 14,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Row
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: const Color(0xFF10B981).withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(
                    Icons.flatware_rounded,
                    color: Color(0xFF10B981),
                    size: 20,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'kitchenNotesAndCutlery'.trOr(context, 'Cutlery & Order Notes'),
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: isDark ? Colors.white : AppColors.neutral,
                        ),
                      ),
                      Text(
                        'customisePreferencesSub'.trOr(context, 'Eco cutlery, condiments & cooking prep'),
                        style: TextStyle(
                          fontSize: 11.5,
                          color: isDark ? Colors.white54 : const Color(0xFF64748B),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),

            const SizedBox(height: 16),

            // 1. Cutlery & Utensils Section
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: subCardBg,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: requestCutlery
                      ? AppColors.primary.withValues(alpha: 0.3)
                      : (isDark ? const Color(0xFF2E3A52) : const Color(0xFFE2E8F0)),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Row(
                          children: [
                            Icon(
                              requestCutlery ? Icons.restaurant_rounded : Icons.eco_rounded,
                              size: 18,
                              color: requestCutlery ? AppColors.primary : const Color(0xFF10B981),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                'requestCutleryPrompt'.trOr(context, 'Include Cutlery & Utensils'),
                                style: TextStyle(
                                  fontSize: 13.5,
                                  fontWeight: FontWeight.w600,
                                  color: isDark ? Colors.white : AppColors.neutral,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      Switch.adaptive(
                        value: requestCutlery,
                        activeTrackColor: AppColors.primary,
                        onChanged: (val) => controller.onIntent(ToggleCutleryIntent(val)),
                      ),
                    ],
                  ),

                  // Eco-friendly banner when OFF
                  if (!requestCutlery) ...[
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
                      decoration: BoxDecoration(
                        color: const Color(0xFF10B981).withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: const Color(0xFF10B981).withValues(alpha: 0.25),
                        ),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.park_rounded, size: 15, color: Color(0xFF10B981)),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              'ecoCutleryNotice'.trOr(
                                context,
                                'Eco Choice: No cutlery will be included. Thank you for reducing plastic!',
                              ),
                              style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w500,
                                color: Color(0xFF10B981),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],

                  // Cutlery Counter when ON
                  if (requestCutlery) ...[
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'cutlerySetsCount'.trOr(context, 'Number of cutlery sets:'),
                          style: TextStyle(
                            fontSize: 12.5,
                            fontWeight: FontWeight.w500,
                            color: isDark ? Colors.white70 : const Color(0xFF475569),
                          ),
                        ),
                        Container(
                          decoration: BoxDecoration(
                            color: isDark ? const Color(0xFF1E2638) : Colors.white,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: borderColor),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              InkWell(
                                onTap: cutleryCount > 1
                                    ? () => controller.onIntent(UpdateCutleryCountIntent(cutleryCount - 1))
                                    : null,
                                borderRadius: const BorderRadius.horizontal(left: Radius.circular(10)),
                                child: Padding(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                  child: Icon(
                                    Icons.remove_rounded,
                                    size: 16,
                                    color: cutleryCount > 1
                                        ? (isDark ? Colors.white : AppColors.neutral)
                                        : Colors.grey.withValues(alpha: 0.5),
                                  ),
                                ),
                              ),
                              Container(
                                constraints: const BoxConstraints(minWidth: 28),
                                alignment: Alignment.center,
                                child: Text(
                                  '$cutleryCount',
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.bold,
                                    color: isDark ? Colors.white : AppColors.neutral,
                                  ),
                                ),
                              ),
                              InkWell(
                                onTap: cutleryCount < 10
                                    ? () => controller.onIntent(UpdateCutleryCountIntent(cutleryCount + 1))
                                    : null,
                                borderRadius: const BorderRadius.horizontal(right: Radius.circular(10)),
                                child: Padding(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                  child: Icon(
                                    Icons.add_rounded,
                                    size: 16,
                                    color: cutleryCount < 10
                                        ? (isDark ? Colors.white : AppColors.neutral)
                                        : Colors.grey.withValues(alpha: 0.5),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),

            const SizedBox(height: 16),

            // 2. Complimentary Condiments & Sauces
            Text(
              'complimentaryCondiments'.trOr(context, 'Condiments & Extras'),
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: isDark ? Colors.white : const Color(0xFF1E293B),
              ),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _availableCondiments.map((condiment) {
                final isSelected = selectedCondiments.contains(condiment);
                return InkWell(
                  onTap: () => controller.onIntent(ToggleCondimentIntent(condiment)),
                  borderRadius: BorderRadius.circular(16),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 180),
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? AppColors.primary.withValues(alpha: 0.12)
                          : (isDark ? const Color(0xFF141A29) : const Color(0xFFF1F5F9)),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: isSelected
                            ? AppColors.primary
                            : (isDark ? const Color(0xFF2E3A52) : const Color(0xFFE2E8F0)),
                        width: isSelected ? 1.5 : 1.0,
                      ),
                    ),
                    child: Text(
                      condiment,
                      style: TextStyle(
                        fontSize: 11.5,
                        fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                        color: isSelected
                            ? AppColors.primary
                            : (isDark ? Colors.white70 : const Color(0xFF475569)),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),

            const SizedBox(height: 16),

            // 3. Kitchen & Cooking Prep Instructions
            Text(
              'kitchenInstructions'.trOr(context, 'Cooking & Kitchen Instructions'),
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: isDark ? Colors.white : const Color(0xFF1E293B),
              ),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _quickPreferences.map((pref) {
                final isSelected = selectedPrefs.contains(pref);
                return InkWell(
                  onTap: () => controller.onIntent(ToggleKitchenPreferenceIntent(pref)),
                  borderRadius: BorderRadius.circular(16),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 180),
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? const Color(0xFFF97316).withValues(alpha: 0.12)
                          : (isDark ? const Color(0xFF141A29) : const Color(0xFFF1F5F9)),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: isSelected
                            ? const Color(0xFFF97316)
                            : (isDark ? const Color(0xFF2E3A52) : const Color(0xFFE2E8F0)),
                        width: isSelected ? 1.5 : 1.0,
                      ),
                    ),
                    child: Text(
                      pref,
                      style: TextStyle(
                        fontSize: 11.5,
                        fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                        color: isSelected
                            ? const Color(0xFFF97316)
                            : (isDark ? Colors.white70 : const Color(0xFF475569)),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),

            const SizedBox(height: 10),

            // Custom Kitchen Note Input
            TextField(
              controller: _kitchenNoteController,
              onChanged: (val) => controller.onIntent(ChangeKitchenNoteIntent(val)),
              maxLength: 120,
              decoration: InputDecoration(
                hintText: 'kitchenNoteHint'.trOr(
                  context,
                  'Special instructions for kitchen (e.g. pack soup separately, allergy alert)',
                ),
                hintStyle: TextStyle(
                  fontSize: 12,
                  color: isDark ? Colors.white38 : Colors.black38,
                ),
                prefixIcon: const Icon(Icons.edit_note_rounded, size: 20),
                suffixIcon: _kitchenNoteController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear_rounded, size: 16),
                        onPressed: () {
                          _kitchenNoteController.clear();
                          controller.onIntent(const ChangeKitchenNoteIntent(''));
                        },
                      )
                    : null,
                filled: true,
                fillColor: subCardBg,
                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                isDense: true,
                counterText: '',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: borderColor),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: borderColor),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppColors.primary),
                ),
              ),
            ),
          ],
        ),
      );
    });
  }
}
