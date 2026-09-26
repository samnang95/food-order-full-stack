import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../domain/address/entities/saved_address_entity.dart';
import '../checkout_intent.dart';
import '../checkout_store.dart';
import 'location_picker_sheet.dart';

class SavedAddressPickerSheet extends StatefulWidget {
  final CheckoutStore store;
  final bool initialAddNew;

  const SavedAddressPickerSheet({
    super.key,
    required this.store,
    this.initialAddNew = false,
  });

  static Future<void> show({
    required BuildContext context,
    required CheckoutStore store,
    bool initialAddNew = false,
  }) async {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: isDark ? const Color(0xFF141A29) : Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => SavedAddressPickerSheet(store: store, initialAddNew: initialAddNew),
    );
  }

  @override
  State<SavedAddressPickerSheet> createState() => _SavedAddressPickerSheetState();
}

class _SavedAddressPickerSheetState extends State<SavedAddressPickerSheet> {
  late bool _isAddingNew;
  String _selectedLabel = 'Home';
  late final TextEditingController _addressController;
  late final TextEditingController _noteController;
  late double _currentLat;
  late double _currentLng;
  bool _setAsDefault = false;

  @override
  void initState() {
    super.initState();
    _isAddingNew = widget.initialAddNew;
    final currentState = widget.store.state.value;
    _addressController = TextEditingController(text: currentState.deliveryAddress);
    _noteController = TextEditingController(text: currentState.deliveryNote);
    _currentLat = currentState.deliveryLat;
    _currentLng = currentState.deliveryLng;
  }

  @override
  void dispose() {
    _addressController.dispose();
    _noteController.dispose();
    super.dispose();
  }

  void _saveNewAddress() {
    final text = _addressController.text.trim();
    if (text.isEmpty) return;

    final newEntity = SavedAddressEntity(
      id: 'addr_${DateTime.now().millisecondsSinceEpoch}',
      label: _selectedLabel,
      address: text,
      lat: _currentLat,
      lng: _currentLng,
      note: _noteController.text.trim(),
      isDefault: _setAsDefault,
    );

    widget.store.addressService.saveAddress(newEntity);
    widget.store.onIntent(SelectSavedAddressIntent(newEntity.id));

    setState(() {
      _isAddingNew = false;
    });

    if (Navigator.of(context).canPop()) {
      Navigator.of(context).pop();
    }
  }

  void _openMapPicker() {
    LocationPickerSheet.show(
      context: context,
      initialAddress: _addressController.text,
      initialLat: _currentLat,
      initialLng: _currentLng,
      onConfirm: (newAddress, newLat, newLng) {
        setState(() {
          _addressController.text = newAddress;
          _currentLat = newLat;
          _currentLng = newLng;
        });
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? const Color(0xFF1E2638) : const Color(0xFFF8FAFC);
    final borderColor = isDark ? const Color(0xFF2E3A52) : const Color(0xFFE2E8F0);

    return SafeArea(
      child: Padding(
        padding: EdgeInsets.only(
          left: 20,
          right: 20,
          top: 12,
          bottom: MediaQuery.of(context).viewInsets.bottom + 16,
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Drag Handle
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: isDark ? Colors.white24 : const Color(0xFFCBD5E1),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),

              // Title Bar
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      _isAddingNew ? 'Add New Address' : 'Saved Addresses',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: isDark ? Colors.white : AppColors.neutral,
                      ),
                    ),
                  ),
                  if (!_isAddingNew)
                    TextButton.icon(
                      key: const ValueKey('btn_add_new'),
                      onPressed: () => setState(() => _isAddingNew = true),
                      icon: const Icon(Icons.add_rounded, size: 18),
                      label: const Text('Add New'),
                      style: TextButton.styleFrom(
                        foregroundColor: AppColors.primary,
                        textStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                    )
                  else
                    TextButton(
                      key: const ValueKey('btn_cancel'),
                      onPressed: () => setState(() => _isAddingNew = false),
                      style: TextButton.styleFrom(
                        foregroundColor: isDark ? Colors.white70 : const Color(0xFF64748B),
                        textStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                      child: const Text('Cancel'),
                    ),
                ],
              ),
              const SizedBox(height: 14),

              if (_isAddingNew) ...[
                // --- ADD NEW ADDRESS FORM ---
                Text(
                  'Address Label',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: isDark ? Colors.white70 : const Color(0xFF475569),
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  children: ['Home', 'Work', 'Other'].map((label) {
                    final isSel = _selectedLabel == label;
                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: ChoiceChip(
                        label: Text(label),
                        selected: isSel,
                        onSelected: (val) {
                          if (val) setState(() => _selectedLabel = label);
                        },
                        selectedColor: AppColors.primary,
                        backgroundColor: cardBg,
                        labelStyle: TextStyle(
                          color: isSel ? Colors.white : (isDark ? Colors.white70 : AppColors.neutral),
                          fontWeight: isSel ? FontWeight.bold : FontWeight.normal,
                          fontSize: 12.5,
                        ),
                        side: BorderSide(
                          color: isSel ? AppColors.primary : borderColor,
                        ),
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 14),

                Text(
                  'Delivery Address',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: isDark ? Colors.white70 : const Color(0xFF475569),
                  ),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: _addressController,
                  maxLines: 2,
                  style: TextStyle(
                    fontSize: 14,
                    color: isDark ? Colors.white : AppColors.neutral,
                  ),
                  decoration: InputDecoration(
                    hintText: 'Street name, house number, area...',
                    filled: true,
                    fillColor: cardBg,
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
                    suffixIcon: IconButton(
                      icon: const Icon(Icons.map_rounded, color: AppColors.primary),
                      tooltip: 'Pick on Map',
                      onPressed: _openMapPicker,
                    ),
                  ),
                ),
                const SizedBox(height: 14),

                Text(
                  'Note for Rider (Optional)',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: isDark ? Colors.white70 : const Color(0xFF475569),
                  ),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: _noteController,
                  style: TextStyle(
                    fontSize: 14,
                    color: isDark ? Colors.white : AppColors.neutral,
                  ),
                  decoration: InputDecoration(
                    hintText: 'e.g. Ring doorbell, 3rd floor',
                    filled: true,
                    fillColor: cardBg,
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
                const SizedBox(height: 12),

                Row(
                  children: [
                    Checkbox(
                      value: _setAsDefault,
                      activeColor: AppColors.primary,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                      onChanged: (val) => setState(() => _setAsDefault = val ?? false),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      'Set as default delivery address',
                      style: TextStyle(
                        fontSize: 13,
                        color: isDark ? Colors.white70 : AppColors.neutral,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    onPressed: _saveNewAddress,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                      elevation: 0,
                    ),
                    child: const Text(
                      'Save & Use Address',
                      style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
              ] else ...[
                // --- SAVED ADDRESSES LIST ---
                Obx(() {
                  final addresses = widget.store.addressService.addresses;
                  final selectedId = widget.store.state.value.selectedAddressId;

                  if (addresses.isEmpty) {
                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: 24),
                      child: Center(
                        child: Text(
                          'No saved addresses yet',
                          style: TextStyle(
                            fontSize: 14,
                            color: isDark ? Colors.white54 : AppColors.subtitleColor,
                          ),
                        ),
                      ),
                    );
                  }

                  return ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: addresses.length,
                    separatorBuilder: (_, _) => const SizedBox(height: 10),
                    itemBuilder: (context, index) {
                      final addr = addresses[index];
                      final isSelected = addr.id == selectedId ||
                          (selectedId == null && addr.address == widget.store.state.value.deliveryAddress);

                      return InkWell(
                        onTap: () {
                          widget.store.onIntent(SelectSavedAddressIntent(addr.id));
                          if (Navigator.of(context).canPop()) {
                            Navigator.of(context).pop();
                          }
                        },
                        borderRadius: BorderRadius.circular(16),
                        child: Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: cardBg,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: isSelected ? AppColors.primary : borderColor,
                              width: isSelected ? 1.5 : 1.0,
                            ),
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Icon Pill
                              Container(
                                padding: const EdgeInsets.all(10),
                                decoration: BoxDecoration(
                                  color: isSelected
                                      ? AppColors.primary.withValues(alpha: 0.15)
                                      : (isDark ? const Color(0xFF28344C) : const Color(0xFFE2E8F0)),
                                  shape: BoxShape.circle,
                                ),
                                child: Icon(
                                  addr.icon,
                                  size: 20,
                                  color: isSelected
                                      ? AppColors.primary
                                      : (isDark ? Colors.white70 : const Color(0xFF475569)),
                                ),
                              ),
                              const SizedBox(width: 12),

                              // Details
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Text(
                                          addr.label.toUpperCase(),
                                          style: TextStyle(
                                            fontSize: 12,
                                            fontWeight: FontWeight.w800,
                                            letterSpacing: 0.5,
                                            color: isSelected
                                                ? AppColors.primary
                                                : (isDark ? Colors.white : AppColors.neutral),
                                          ),
                                        ),
                                        if (addr.isDefault) ...[
                                          const SizedBox(width: 6),
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                                            decoration: BoxDecoration(
                                              color: AppColors.primary.withValues(alpha: 0.1),
                                              borderRadius: BorderRadius.circular(4),
                                            ),
                                            child: const Text(
                                              'DEFAULT',
                                              style: TextStyle(
                                                fontSize: 9.5,
                                                fontWeight: FontWeight.bold,
                                                color: AppColors.primary,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ],
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      addr.address,
                                      style: TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w500,
                                        color: isDark ? Colors.white70 : const Color(0xFF334155),
                                        height: 1.3,
                                      ),
                                    ),
                                    if (addr.note.isNotEmpty) ...[
                                      const SizedBox(height: 3),
                                      Text(
                                        'Note: ${addr.note}',
                                        style: TextStyle(
                                          fontSize: 11.5,
                                          fontStyle: FontStyle.italic,
                                          color: isDark ? Colors.white38 : const Color(0xFF94A3B8),
                                        ),
                                      ),
                                    ],
                                  ],
                                ),
                              ),

                              const SizedBox(width: 8),

                              // Radio / Selected Indicator & Delete
                              Column(
                                children: [
                                  if (isSelected)
                                    const Icon(
                                      Icons.check_circle_rounded,
                                      color: AppColors.primary,
                                      size: 22,
                                    )
                                  else
                                    const Icon(
                                      Icons.radio_button_unchecked_rounded,
                                      color: Colors.black26,
                                      size: 22,
                                    ),
                                  const SizedBox(height: 8),
                                  GestureDetector(
                                    onTap: () {
                                      widget.store.onIntent(DeleteSavedAddressIntent(addr.id));
                                    },
                                    child: Icon(
                                      Icons.delete_outline_rounded,
                                      size: 18,
                                      color: isDark ? Colors.white24 : Colors.black26,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  );
                }),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
