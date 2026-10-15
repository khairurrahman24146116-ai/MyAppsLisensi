import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

export default function App() {
  const [orderNumber, setOrderNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const submit = async () => {
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/lisensi`, { order_number: orderNumber });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (result?.license_code) {
      Alert.alert("Disalin", result.license_code);
    }
  };

  const checkStatus = async () => {
    if (!orderNumber) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/lisensi/status?order_number=${orderNumber}`);
      setResult(res.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Pesanan tidak ditemukan");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setOrderNumber("");
    setResult(null);
    setError("");
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100">
      <ScrollView className="flex-1 px-4 py-6">
        <Text className="text-3xl font-bold text-gray-900 mb-2">Dapatkan Lisensi</Text>
        <Text className="text-gray-600 mb-6">Masukkan nomor pesanan Anda</Text>

        <View className="bg-white rounded-lg p-6 shadow-lg">
          <TextInput
            value={orderNumber}
            onChangeText={setOrderNumber}
            placeholder="Cth: ORD-2024-001"
            placeholderTextColor="#999"
            className="border border-gray-300 rounded-lg px-4 py-3 mb-4 text-base"
            editable={!loading}
          />

          <TouchableOpacity
            onPress={submit}
            disabled={loading}
            className={`${loading ? "bg-gray-400" : "bg-blue-600"} rounded-lg py-3 mb-3`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-semibold">Dapatkan Lisensi</Text>
            )}
          </TouchableOpacity>

          {error && (
            <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <Text className="text-red-700 text-sm">{error}</Text>
            </View>
          )}

          {result && (
            <View className="space-y-3">
              <View className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <Text className="text-gray-600 text-sm">Status</Text>
                <Text className="text-lg font-semibold text-blue-600 mt-1">{result.status}</Text>
              </View>

              {result.license_code && (
                <View className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <Text className="text-gray-600 text-sm">Kode Lisensi</Text>
                  <Text className="font-mono font-semibold text-green-600 mt-1 text-base">{result.license_code}</Text>
                  <TouchableOpacity onPress={copyCode} className="mt-2 bg-green-600 rounded py-2">
                    <Text className="text-white text-center text-sm font-semibold">Salin</Text>
                  </TouchableOpacity>
                </View>
              )}

              {result.message && <Text className="text-gray-600 text-sm">{result.message}</Text>}

              <TouchableOpacity onPress={reset} className="bg-gray-200 rounded-lg py-3">
                <Text className="text-gray-700 text-center font-semibold">Input Pesanan Lain</Text>
              </TouchableOpacity>
            </View>
          )}

          {!result && (
            <TouchableOpacity onPress={checkStatus} className="bg-gray-200 rounded-lg py-3">
              <Text className="text-gray-700 text-center font-semibold">Cek Status</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
