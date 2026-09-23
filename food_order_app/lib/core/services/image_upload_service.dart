import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';
import '../constants/api_constants.dart';
import 'api_client.dart';

class ImageUploadService {
  static final ImagePicker _picker = ImagePicker();

  static Future<String?> pickAndUpload({
    ImageSource source = ImageSource.gallery,
    int imageQuality = 80,
  }) async {
    try {
      final XFile? image = await _picker.pickImage(
        source: source,
        imageQuality: imageQuality,
        maxWidth: 1200,
        maxHeight: 1200,
      );

      if (image == null) {
        debugPrint('⚪ [ImageUpload] User cancelled image selection');
        return null;
      }

      debugPrint('📷 [ImageUpload] Selected: ${image.name} (${image.path})');
      return await uploadFile(image);
    } catch (e) {
      debugPrint('❌ [ImageUpload] Pick & upload failed: $e');
      rethrow;
    }
  }

  static Future<String?> uploadFile(XFile file) async {
    try {
      final token = ApiClient.getToken();
      if (token == null) {
        throw Exception('Not authenticated. Please log in first.');
      }

      final url = Uri.parse('${ApiConstants.baseUrl}/upload');
      debugPrint('🌐 [ImageUpload] Uploading to $url...');

      final request = http.MultipartRequest('POST', url)
        ..headers['Authorization'] = 'Bearer $token'
        ..files.add(await http.MultipartFile.fromPath('image', file.path));

      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      debugPrint('🌐 [ImageUpload] Response: ${response.statusCode}');

      if (response.statusCode == 201) {
        final data = jsonDecode(response.body);
        final imageUrl = data['image']['url'] as String;
        debugPrint('✅ [ImageUpload] Uploaded: $imageUrl');
        return imageUrl;
      } else {
        final errorMsg = jsonDecode(response.body)['message'] ?? 'Upload failed';
        throw Exception(errorMsg);
      }
    } catch (e) {
      debugPrint('❌ [ImageUpload] Upload failed: $e');
      rethrow;
    }
  }
}
