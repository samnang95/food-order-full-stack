class TranslationHelper {
  TranslationHelper._();

  static Map<String, dynamic> flatten(Map<String, dynamic> map, [String prefix = '']) {
    final Map<String, dynamic> flattened = {};

    for (final entry in map.entries) {
      final key = entry.key;
      final value = entry.value;

      if (value is Map<String, dynamic>) {
        final nested = flatten(value, '$prefix$key.');
        flattened.addAll(nested);
        for (final subEntry in value.entries) {
          if (subEntry.value is String) {
            flattened.putIfAbsent(subEntry.key, () => subEntry.value);
          }
        }
      } else if (value is String) {
        flattened['$prefix$key'] = value;
        flattened.putIfAbsent(key, () => value);
      }
    }

    return flattened;
  }
}
