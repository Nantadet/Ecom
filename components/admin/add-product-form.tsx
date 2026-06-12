"use client";

import * as React from "react";
import { Gem, PackagePlus, Pencil, Plus, Trash2, Upload, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/lib/client/language-context";
import type { Product, ProductOption } from "./types";

type OptionDraft = {
  id: string;
  label: string;
  imageUrl: string;
  stock: string;
};

const FLOW_CATEGORY_OPTIONS = [
  { value: "bottle", label: "ขวดน้ำ", hint: "หน้าแรก -> หน้าขวดน้ำ" },
  { value: "secret", label: "Secret Set", hint: "หน้า 3 บล็อก -> Secret" },
  { value: "bracelet", label: "สร้อยข้อมือ", hint: "หน้า 3 บล็อก -> สร้อย" },
  { value: "charm", label: "Charm", hint: "หน้า 3 บล็อก -> เลือกซื้อ Charm" },
  { value: "other", label: "อื่น ๆ", hint: "สินค้าแสดงแบบทั่วไป" },
];

const FLOW_CATEGORY_VALUES = FLOW_CATEGORY_OPTIONS.map((item) => item.value);

function initialCategory(value?: string) {
  const normalized = value?.trim();
  if (!normalized) return "bottle";
  return FLOW_CATEGORY_VALUES.includes(normalized) ? normalized : "other";
}

function optionDraft(option: ProductOption, index: number): OptionDraft {
  return {
    id: `${index}-${option.label}`,
    label: option.label,
    imageUrl: option.imageUrl ?? "",
    stock: option.stock == null ? "" : String(option.stock),
  };
}

export function AddProductForm({ onSubmit, onUpdate, notify, t, open: controlledOpen, onClose, product }: {
  onSubmit: (fd: FormData) => void;
  onUpdate?: (p: Product) => void;
  notify: (msg: string) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
  open?: boolean;
  onClose?: () => void;
  product?: Product;
}) {
  const isEditMode = !!product;
  const [open, setOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : open;
  const handleClose = () => { setOpen(false); onClose?.(); };

  const [imagePreviews, setImagePreviews] = React.useState<string[]>(() => {
    if (product?.imageUrls && product.imageUrls.length > 0) return product.imageUrls;
    if (product?.imageUrl) return [product.imageUrl];
    return [];
  });
  const [category, setCategory] = React.useState(initialCategory(product?.category));
  const [optionRows, setOptionRows] = React.useState<OptionDraft[]>(() =>
    (product?.options ?? []).map((option, index) => optionDraft(option, index)),
  );
  const [imageError, setImageError] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const formRef = React.useRef<HTMLFormElement>(null);
  const { lang } = useLanguage();
  void lang;

  const MAX_IMAGES = 5;

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    files.slice(0, MAX_IMAGES).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        setImagePreviews((p) => p.length < MAX_IMAGES && !p.includes(result) ? [...p, result] : p);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  }

  function removeImage(idx: number) {
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
  }

  function addOptionRow() {
    setOptionRows((rows) => [
      ...rows,
      { id: `new-${Date.now()}`, label: "", imageUrl: "", stock: "" },
    ]);
  }

  function updateOptionRow(id: string, patch: Partial<OptionDraft>) {
    setOptionRows((rows) => rows.map((row) => row.id === id ? { ...row, ...patch } : row));
  }

  function removeOptionRow(id: string) {
    setOptionRows((rows) => rows.filter((row) => row.id !== id));
  }

  const normalizedOptions = optionRows
    .map((row) => ({
      label: row.label.trim(),
      imageUrl: row.imageUrl.trim(),
      stock: row.stock === "" ? undefined : Math.max(0, Number(row.stock) || 0),
    }))
    .filter((row) => row.label);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (imagePreviews.length === 0) {
      setImageError(true);
      return;
    }
    setImageError(false);
    const fd = new FormData(e.currentTarget);
    if (imagePreviews[0]) fd.set("imageUrl", imagePreviews[0]);
    fd.set("imageUrls", JSON.stringify(imagePreviews));
    fd.set("category", category);
    fd.set("options", JSON.stringify(normalizedOptions));

    if (isEditMode && onUpdate && product) {
      onUpdate({
        ...product,
        name: {
          th: String(fd.get("name") ?? product.name.th).trim(),
          en: String(fd.get("nameEn") ?? product.name.en ?? "").trim() || undefined,
        },
        price: Number(fd.get("price")) || product.price,
        stock: Number(fd.get("stock")) ?? product.stock,
        shippingFirstItem: Number(fd.get("shippingFirstItem")) || 0,
        shippingAdditionalItem: Number(fd.get("shippingAdditionalItem")) || 0,
        remoteShippingFirstItem: Number(fd.get("remoteShippingFirstItem")) || 0,
        remoteShippingAdditionalItem: Number(fd.get("remoteShippingAdditionalItem")) || 0,
        islandShippingFirstItem: Number(fd.get("islandShippingFirstItem")) || 0,
        islandShippingAdditionalItem: Number(fd.get("islandShippingAdditionalItem")) || 0,
        description: {
          th: String(fd.get("description") ?? product.description?.th ?? "").trim(),
          en: String(fd.get("descriptionEn") ?? product.description?.en ?? "").trim() || undefined,
        },
        category,
        imageUrl: imagePreviews[0] ?? product.imageUrl,
        imageUrls: imagePreviews.length > 0 ? imagePreviews : undefined,
        options: normalizedOptions,
      });
    } else {
      onSubmit(fd);
    }

    formRef.current?.reset();
    setImagePreviews([]);
    setOptionRows([]);
    if (!isEditMode) setCategory("bottle");
    handleClose();
  }

  void notify;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            {isEditMode
              ? <Pencil className="w-5 h-5 text-[#85241F]" />
              : <PackagePlus className="w-5 h-5 text-[#85241F]" />}
            <span className="font-black text-gray-900">
              {isEditMode
              ? t("admin.products.edit.title")
              : t("admin.products.add_title")}
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose} className="rounded-full h-8 w-8">
            <XCircle className="w-4 h-4 text-gray-400" />
          </Button>
        </div>

        {/* Form */}
        <div className="overflow-y-auto flex-1 px-5 py-4">
          <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-3.5">

            {/* Product images */}
            <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
            <div className="flex flex-col gap-2">
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {imagePreviews.map((src, idx) => (
                    <div key={idx} className="relative aspect-square">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="w-full h-full object-cover rounded-xl border border-gray-200" />
                      {idx === 0 && (
                        <span className="absolute top-1 left-1 bg-[#85241F] text-white text-[8px] font-black px-1.5 py-0.5 rounded-md">{t("admin.products.image.primary")}</span>
                      )}
                      <button type="button" onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 w-6 h-6 bg-white rounded-full shadow flex items-center justify-center cursor-pointer">
                        <XCircle className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                    </div>
                  ))}
                  {imagePreviews.length < MAX_IMAGES && (
                    <button type="button" onClick={() => fileRef.current?.click()}
                      className="aspect-square border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-1 hover:border-[#85241F]/30 transition-colors cursor-pointer">
                      <Upload className="w-4 h-4 text-gray-400" />
                      <span className="text-[9px] text-gray-400 font-bold">{t("admin.products.image.add")}</span>
                    </button>
                  )}
                </div>
              )}
              {imagePreviews.length === 0 && (
                <button type="button" onClick={() => { fileRef.current?.click(); setImageError(false); }}
                  className={`w-full border-2 border-dashed rounded-xl py-6 flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${imageError ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-[#85241F]/30"}`}>
                  <Upload className={`w-5 h-5 ${imageError ? "text-red-400" : "text-gray-400"}`} />
                  <span className={`text-xs font-bold ${imageError ? "text-red-500" : "text-gray-400"}`}>
                    {imageError ? t("admin.products.image.required") : t("admin.products.image.upload")}
                  </span>
                  <span className="text-[10px] text-gray-300">{t("admin.products.image.hint", { max: MAX_IMAGES })}</span>
                </button>
              )}
            </div>

            {/* Basic fields */}
            <div className="grid grid-cols-2 gap-3">
              {/* Name */}
              <div className="col-span-2 grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10px] mb-1.5 flex items-center gap-1 font-bold text-gray-500">
                    <span>🇹🇭</span> ชื่อสินค้า
                  </Label>
                  <Input name="name" required defaultValue={product?.name.th ?? ""} placeholder="เช่น น้ำดื่ม HLLC" className="rounded-xl border-gray-200 text-xs h-10" />
                </div>
                <div>
                  <Label className="text-[10px] mb-1.5 flex items-center gap-1 font-bold text-gray-500">
                    <span>🇬🇧</span> Product Name
                  </Label>
                  <Input name="nameEn" defaultValue={product?.name.en ?? ""} placeholder="e.g. HLLC Water" className="rounded-xl border-gray-200 text-xs h-10" />
                </div>
              </div>

              {/* Price & Stock */}
              <div>
                <Label className="text-[10px] mb-1.5 block font-bold text-gray-500">ราคา (฿)</Label>
                <Input name="price" type="number" min="0" required defaultValue={product?.price ?? ""} placeholder="0" className="rounded-xl border-gray-200 text-xs h-10" />
              </div>
              <div>
                <Label className="text-[10px] mb-1.5 block font-bold text-gray-500">จำนวนสต็อก</Label>
                <Input name="stock" type="number" min="0" required defaultValue={product?.stock ?? ""} placeholder="0" className="rounded-xl border-gray-200 text-xs h-10" />
              </div>

              {/* Shipping — normal (0 = ใช้ค่าส่งเริ่มต้นของร้าน) */}
              <div>
                <Label className="text-[10px] mb-1.5 block font-bold text-gray-500">ค่าส่งชิ้นแรก (฿)</Label>
                <Input name="shippingFirstItem" type="number" min="0" defaultValue={product?.shippingFirstItem ?? 50} placeholder="50" className="rounded-xl border-gray-200 text-xs h-10" />
              </div>
              <div>
                <Label className="text-[10px] mb-1.5 block font-bold text-gray-500">ค่าส่งชิ้นถัดไป (฿)</Label>
                <Input name="shippingAdditionalItem" type="number" min="0" defaultValue={product?.shippingAdditionalItem ?? 10} placeholder="10" className="rounded-xl border-gray-200 text-xs h-10" />
              </div>

              {/* Shipping — remote area */}
              <div>
                <Label className="text-[10px] mb-1.5 block font-bold text-gray-500">ค่าส่งห่างไกล ชิ้นแรก (฿)</Label>
                <Input name="remoteShippingFirstItem" type="number" min="0" defaultValue={product?.remoteShippingFirstItem ?? 80} placeholder="80" className="rounded-xl border-gray-200 text-xs h-10" />
              </div>
              <div>
                <Label className="text-[10px] mb-1.5 block font-bold text-gray-500">ค่าส่งห่างไกล ชิ้นถัดไป (฿)</Label>
                <Input name="remoteShippingAdditionalItem" type="number" min="0" defaultValue={product?.remoteShippingAdditionalItem ?? 15} placeholder="15" className="rounded-xl border-gray-200 text-xs h-10" />
              </div>

              {/* Shipping — island / tourist area */}
              <div>
                <Label className="text-[10px] mb-1.5 block font-bold text-gray-500">ค่าส่งพื้นที่พิเศษ ชิ้นแรก (฿)</Label>
                <Input name="islandShippingFirstItem" type="number" min="0" defaultValue={product?.islandShippingFirstItem ?? 100} placeholder="100" className="rounded-xl border-gray-200 text-xs h-10" />
              </div>
              <div>
                <Label className="text-[10px] mb-1.5 block font-bold text-gray-500">ค่าส่งพื้นที่พิเศษ ชิ้นถัดไป (฿)</Label>
                <Input name="islandShippingAdditionalItem" type="number" min="0" defaultValue={product?.islandShippingAdditionalItem ?? 15} placeholder="15" className="rounded-xl border-gray-200 text-xs h-10" />
              </div>

              {/* Category */}
              <div className="hidden">
                <Label className="text-[10px] mb-1.5 block font-bold text-gray-500">หมวดหมู่</Label>
                <Input name="category" defaultValue={product?.category ?? ""} placeholder="เช่น เครื่องดื่ม, เสื้อผ้า" className="rounded-xl border-gray-200 text-xs h-10" />
              </div>

              <div className="col-span-2">
                <Label className="text-[10px] mb-1.5 block font-bold text-gray-500">Flow / หมวดสินค้า</Label>
                <Select name="categoryFlow" value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-10 rounded-xl text-xs font-bold">
                    <SelectValue placeholder="เลือก flow สินค้า" />
                  </SelectTrigger>
                  <SelectContent>
                    {FLOW_CATEGORY_OPTIONS.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        <span className="flex flex-col">
                          <span className="text-xs font-black">{item.label}</span>
                          <span className="text-[10px] font-semibold text-gray-400">{item.hint}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2 rounded-2xl border border-gray-100 bg-gray-50 p-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Gem className="h-4 w-4 text-[#85241F]" />
                    <div>
                      <p className="text-xs font-black text-gray-800">ตัวเลือก / Charm</p>
                      <p className="text-[10px] font-semibold text-gray-400">ใช้กับสินค้า Charm หรือสินค้าที่ต้องเลือกแบบ</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addOptionRow}
                    className="h-8 rounded-xl px-2 text-[10px] font-black"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    เพิ่ม
                  </Button>
                </div>

                {optionRows.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {optionRows.map((row) => (
                      <div key={row.id} className="grid grid-cols-[minmax(0,1fr)_72px_32px] gap-2 rounded-xl bg-white p-2">
                        <div className="grid gap-2">
                          <Input
                            value={row.label}
                            onChange={(e) => updateOptionRow(row.id, { label: e.target.value })}
                            placeholder="ชื่อ Charm / ตัวเลือก"
                            className="h-9 rounded-lg text-xs"
                          />
                          <Input
                            value={row.imageUrl}
                            onChange={(e) => updateOptionRow(row.id, { imageUrl: e.target.value })}
                            placeholder="URL รูปตัวเลือก (ถ้ามี)"
                            className="h-9 rounded-lg text-xs"
                          />
                        </div>
                        <Input
                          value={row.stock}
                          onChange={(e) => updateOptionRow(row.id, { stock: e.target.value })}
                          type="number"
                          min="0"
                          placeholder="สต็อก"
                          className="h-9 rounded-lg text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => removeOptionRow(row.id)}
                          className="flex h-9 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50"
                          aria-label="ลบตัวเลือก"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-xl border border-dashed border-gray-200 bg-white px-3 py-3 text-center text-[11px] font-semibold text-gray-400">
                    ยังไม่มีตัวเลือก ถ้าเป็น Charm ให้เพิ่มรายการ charm ที่ลูกค้าต้องเลือก
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="col-span-2 grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10px] mb-1.5 flex items-center gap-1 font-bold text-gray-500">
                    <span>🇹🇭</span> รายละเอียด
                  </Label>
                  <Textarea name="description" rows={2} defaultValue={product?.description?.th ?? ""} placeholder="รายละเอียดภาษาไทย..." className="rounded-xl border-gray-200 text-xs resize-none" />
                </div>
                <div>
                  <Label className="text-[10px] mb-1.5 flex items-center gap-1 font-bold text-gray-500">
                    <span>🇬🇧</span> Description
                  </Label>
                  <Textarea name="descriptionEn" rows={2} defaultValue={product?.description?.en ?? ""} placeholder="Description in English..." className="rounded-xl border-gray-200 text-xs resize-none" />
                </div>
              </div>
            </div>


            <Button type="submit" className="bg-[#85241F] hover:bg-[#B72D2A] rounded-xl h-11 w-full text-xs font-bold shadow-md shadow-[#85241F]/10 cursor-pointer transition-all active:scale-98">
              {isEditMode
                ? <><Pencil className="w-4 h-4 mr-1" /> {t("admin.products.edit.save")}</>
                : <><PackagePlus className="w-4 h-4 mr-1" /> {t("admin.products.add_title")}</>}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddProductForm;
