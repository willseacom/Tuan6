import { COLOR_ORDER, PHONES } from "../data/phones";
import { ColorKey, Phone } from "../types";


// CẤU HÌNH API & CHẾ ĐỘ KẾT NỐI (BÀI 2)

const DEFAULT_API_URL = "https://6addc3d24e88f1bba4a49aa0.mockapi.io";

export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_API_URL).replace(/\/$/, "");
export const USING_API = API_URL !== "";
const RESOURCE = "phones"; 

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));


// HÀM CHUẨN HÓA DỮ LIỆU (BÀI 2)
// Đảm bảo dữ liệu trả về từ API đúng kiểu Phone, tránh lỗi crash app
function normalize(raw: any): Phone {
  const valid = (c: unknown): c is ColorKey => COLOR_ORDER.includes(c as ColorKey);
  const colorList: ColorKey[] = Array.isArray(raw.colors) ? raw.colors.filter(valid) : [];
  return {
    id: String(raw.id),
    name: String(raw.name ?? ""),
    price: Number(raw.price) || 0,
    oldPrice: Number(raw.oldPrice) || 0,
    rating: Math.max(0, Math.min(5, Math.round(Number(raw.rating) || 0))),
    reviewCount: Number(raw.reviewCount) || 0,
    supplier: String(raw.supplier ?? ""),
    badge: String(raw.badge ?? ""),
    colors: colorList.length > 0 ? colorList : COLOR_ORDER,
    defaultColor: valid(raw.defaultColor) ? raw.defaultColor : "blue",
  };
}


// HÀM LẤY CHI TIẾT SẢN PHẨM THEO ID (BÀI 4)

export async function fetchPhone(id: string): Promise<Phone> {
  if (!USING_API) {                    // Chế độ offline: giả lập độ trễ lấy từ phones.ts
    await sleep(600);
    const p = PHONES.find((x) => x.id === id);
    if (!p) throw new Error(`Không tìm thấy sản phẩm #${id}`);
    return p;
  }
  // Chế độ online: Gọi API lấy sản phẩm theo ID
  const res = await fetch(`${API_URL}/${RESOURCE}/${id}`);
  if (res.status === 404) throw new Error(`Không tìm thấy sản phẩm #${id}`);
  if (!res.ok) throw new Error(`Máy chủ trả về lỗi ${res.status}`);
  return normalize(await res.json());
}


// HÀM LẤY TOÀN BỘ DANH SÁCH SẢN PHẨM (BÀI 3 & BÀI 4)

export async function fetchPhones(): Promise<Phone[]> {
  if (!USING_API) {                    // Chế độ offline
    await sleep(600);
    return PHONES;
  }
  // Chế độ online: Gọi API lấy toàn bộ danh sách
  const res = await fetch(`${API_URL}/${RESOURCE}`);
  if (!res.ok) throw new Error(`Máy chủ trả về lỗi ${res.status}`);
  const data = await res.json();
  return (data as any[]).map(normalize);
}