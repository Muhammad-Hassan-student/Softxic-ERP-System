"use client";

import React, { useState } from "react";
import {
  Printer,
  Upload,
  Banknote,
  Building,
  Wallet,
  Receipt,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { apiRequest } from "@/lib/api-request";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

const paymentSchema = z.object({
  amount: z.coerce.number().min(1, "Amount must be greater than 0"),
  paymentMode: z.enum(["bank", "cash", "loan", "advance", "adjustment"]),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  transactionId: z.string().optional(),
  paymentDetails: z.string().optional(),
  screenshot: z.instanceof(File).optional(),
  slipNo: z.string(),
  paymentDate: z.string(),
  receiptDate: z.string(),
  isAdvance: z.boolean().default(false),
  advanceAmount: z.coerce.number().optional(),
  remainingAmount: z.coerce.number().optional(),
  deductionType: z
    .enum(["none", "loan", "advance", "tax", "other"])
    .default("none"),
  deductionAmount: z.coerce.number().optional(),
  deductionReason: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface EnhancedPaymentDialogProps {
  employee: {
    id: string;
    fullName: string;
    rollNo: string;
    salary: number;
    incentive: number;
    taxAmount: number;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export const EnhancedPaymentDialog: React.FC<EnhancedPaymentDialogProps> = ({
  employee,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema) as any,
    defaultValues: {
      amount: employee.salary + employee.incentive - employee.taxAmount,
      paymentMode: "bank",
      bankName: "",
      accountNumber: "",
      transactionId: "",
      paymentDetails: "",
      slipNo: `SLIP-${Date.now().toString().slice(-8)}`,
      paymentDate: new Date().toISOString().split("T")[0],
      receiptDate: new Date().toISOString().split("T")[0],
      isAdvance: false,
      advanceAmount: 0,
      remainingAmount: 0,
      deductionType: "none",
      deductionAmount: 0,
      deductionReason: "",
    },
  });

  const paymentMode = form.watch("paymentMode");
  const deductionType = form.watch("deductionType");
  const isAdvance = form.watch("isAdvance");

  const calculateNetAmount = () => {
    const salary = employee.salary;
    const incentive = employee.incentive;
    const tax = employee.taxAmount;
    const deduction = form.getValues("deductionAmount") || 0;
    return salary + incentive - tax - deduction;
  };

  const loadPaymentHistory = async () => {
    try {
      const response = await apiRequest(`/api/payments/history/${employee.id}`);
      if (response.success) {
        setPaymentHistory(response.data || []);
      }
    } catch (error) {
      console.error("Error loading payment history:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshotFile(file);
    }
  };

  const onSubmit = async (data: PaymentFormData) => {
    try {
      setLoading(true);

      const formData = new FormData();
      
      // Append all form data
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (typeof value === 'boolean') {
            formData.append(key, value.toString());
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      formData.append("employeeId", employee.id);

      if (screenshotFile) {
        formData.append("screenshot", screenshotFile);
      }

      const response = await apiRequest("/api/payments", {
        method: "POST",
        body: formData,
      });

      if (response.success) {
        toast.success("Payment recorded successfully");
        onSuccess();
      } else {
        toast.error(response.message || "Failed to record payment");
      }
    } catch (error) {
      console.error("Error recording payment:", error);
      toast.error("Failed to record payment");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndPrint = async () => {
    await form.handleSubmit(onSubmit)();
    setTimeout(() => {
      printPaymentSlip();
    }, 500);
  };

  const printPaymentSlip = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      const data = form.getValues();
      printWindow.document.write(`
        <html>
          <head>
            <title>Payment Slip - ${employee.fullName}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .company-name { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
              .payment-slip { font-size: 18px; color: #555; }
              .employee-info, .payment-info { margin-bottom: 25px; }
              .section-title { font-weight: bold; border-bottom: 2px solid #000; padding-bottom: 5px; margin-bottom: 10px; }
              .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
              .label { font-weight: bold; }
              .total-row { border-top: 2px solid #000; padding-top: 10px; font-weight: bold; font-size: 16px; }
              .signature-section { margin-top: 60px; }
              .signature-line { width: 300px; border-top: 1px solid #000; margin-top: 60px; }
              .stamp-area { width: 150px; height: 100px; border: 2px dashed #ccc; margin-top: 30px; }
              @media print {
                body { -webkit-print-color-adjust: exact; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="company-name">ENTERPRISE ERP SYSTEM</div>
              <div class="payment-slip">PAYMENT SLIP</div>
              <div>Date: ${new Date().toLocaleDateString()}</div>
            </div>
            
            <div class="employee-info">
              <div class="section-title">Employee Information</div>
              <div class="info-row">
                <span class="label">Name:</span>
                <span>${employee.fullName}</span>
              </div>
              <div class="info-row">
                <span class="label">Roll No:</span>
                <span>${employee.rollNo}</span>
              </div>
              <div class="info-row">
                <span class="label">Slip No:</span>
                <span>${data.slipNo}</span>
              </div>
            </div>
            
            <div class="payment-info">
              <div class="section-title">Payment Details</div>
              <div class="info-row">
                <span class="label">Payment Date:</span>
                <span>${new Date(data.paymentDate).toLocaleDateString()}</span>
              </div>
              <div class="info-row">
                <span class="label">Payment Mode:</span>
                <span>${data.paymentMode.toUpperCase()}</span>
              </div>
              ${
                data.bankName
                  ? `
                <div class="info-row">
                  <span class="label">Bank:</span>
                  <span>${data.bankName}</span>
                </div>
                <div class="info-row">
                  <span class="label">Account:</span>
                  <span>${data.accountNumber}</span>
                </div>
              `
                  : ""
              }
            </div>
            
            <div class="payment-info">
              <div class="section-title">Amount Breakdown</div>
              <div class="info-row">
                <span class="label">Basic Salary:</span>
                <span>PKR ${employee.salary.toLocaleString()}</span>
              </div>
              <div class="info-row">
                <span class="label">Incentive:</span>
                <span>PKR ${employee.incentive.toLocaleString()}</span>
              </div>
              <div class="info-row">
                <span class="label">Tax Deduction:</span>
                <span>PKR ${employee.taxAmount.toLocaleString()}</span>
              </div>
              ${
                data.deductionAmount
                  ? `
                <div class="info-row">
                  <span class="label">${data.deductionType} Deduction:</span>
                  <span>PKR ${data.deductionAmount.toLocaleString()}</span>
                </div>
              `
                  : ""
              }
              <div class="info-row total-row">
                <span class="label">NET PAYABLE:</span>
                <span>PKR ${calculateNetAmount().toLocaleString()}</span>
              </div>
            </div>
            
            <div class="signature-section">
              <div>Receiver's Signature</div>
              <div class="signature-line"></div>
              <div style="margin-top: 10px; font-size: 12px;">Date: ___________________</div>
              
              <div style="margin-top: 40px;">
                <div>Authorized Signature</div>
                <div class="signature-line"></div>
              </div>
              
              <div style="margin-top: 40px;">
                <div>Official Stamp</div>
                <div class="stamp-area"></div>
              </div>
            </div>
            
            <div class="no-print" style="margin-top: 50px;">
              <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Print This Slip
              </button>
              <button onclick="window.close()" style="padding: 10px 20px; margin-left: 10px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Close Window
              </button>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  React.useEffect(() => {
    loadPaymentHistory();
  }, []);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Process Payment - {employee.fullName}</DialogTitle>
          <p className="text-sm text-gray-500">
            Roll No: {employee.rollNo} | Net Payable: PKR{" "}
            {calculateNetAmount().toLocaleString()}
          </p>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="bank">Bank Details</TabsTrigger>
            <TabsTrigger value="deductions">Deductions</TabsTrigger>
            <TabsTrigger value="history">Payment History</TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Tab 1: Basic Information */}
              <TabsContent value="basic" className="space-y-6">
                {/* Salary Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Banknote className="h-5 w-5" />
                    Salary Summary
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-3 rounded shadow-sm">
                      <p className="text-sm text-gray-600">Basic Salary</p>
                      <p className="font-semibold">
                        PKR {employee.salary.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded shadow-sm">
                      <p className="text-sm text-gray-600">Incentive</p>
                      <p className="font-semibold text-green-600">
                        PKR {employee.incentive.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded shadow-sm">
                      <p className="text-sm text-gray-600">Tax Deduction</p>
                      <p className="font-semibold text-red-600">
                        PKR {employee.taxAmount.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded shadow-sm">
                      <p className="text-sm text-gray-600">Net Payable</p>
                      <p className="text-xl font-bold">
                        PKR {calculateNetAmount().toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Amount (PKR) *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            value={field.value}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paymentMode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Mode *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="bank">
                              <div className="flex items-center gap-2">
                                <Building className="h-4 w-4" />
                                Bank Transfer
                              </div>
                            </SelectItem>
                            <SelectItem value="cash">
                              <div className="flex items-center gap-2">
                                <Wallet className="h-4 w-4" />
                                Cash
                              </div>
                            </SelectItem>
                            <SelectItem value="loan">Loan Payment</SelectItem>
                            <SelectItem value="advance">
                              Advance Payment
                            </SelectItem>
                            <SelectItem value="adjustment">
                              Salary Adjustment
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="slipNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slip No *</FormLabel>
                        <FormControl>
                          <Input {...field} readOnly className="bg-gray-50" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paymentDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Date *</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="date" 
                            value={field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="paymentDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={3}
                          placeholder="Additional payment details or instructions..."
                          value={field.value || ''}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* Tab 2: Bank Details */}
              <TabsContent value="bank" className="space-y-6">
                {paymentMode === "bank" && (
                  <>
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Bank Transfer Details
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="bankName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bank Name</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Bank" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="HBL">HBL</SelectItem>
                                <SelectItem value="UBL">UBL</SelectItem>
                                <SelectItem value="MCB">MCB</SelectItem>
                                <SelectItem value="Allied">
                                  Allied Bank
                                </SelectItem>
                                <SelectItem value="Askari">
                                  Askari Bank
                                </SelectItem>
                                <SelectItem value="Bank Alfalah">
                                  Bank Alfalah
                                </SelectItem>
                                <SelectItem value="Meezan">
                                  Meezan Bank
                                </SelectItem>
                                <SelectItem value="other">
                                  Other Bank
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="accountNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Account Number</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="XXXX-XXXX-XXXX-XXXX"
                                value={field.value || ''}
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="transactionId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Transaction ID</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="TRX-XXXX-XXXX" 
                              value={field.value || ''}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {/* Screenshot Upload */}
                <div>
                  <FormLabel>Screenshot / Receipt Upload</FormLabel>
                  <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 mb-2">
                      Drag & drop screenshot or click to browse
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      Supported formats: JPG, PNG, PDF (Max 5MB)
                    </p>
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="cursor-pointer mx-auto max-w-xs"
                    />
                    {screenshotFile && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-700">
                          ✓ File selected: {screenshotFile.name}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Tab 3: Deductions */}
              <TabsContent value="deductions" className="space-y-6">
                <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-4 rounded-lg border border-amber-200">
                  <h4 className="font-semibold mb-3">
                    Deductions & Adjustments
                  </h4>
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="deductionType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deduction Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">No Deduction</SelectItem>
                            <SelectItem value="loan">Loan Repayment</SelectItem>
                            <SelectItem value="advance">
                              Advance Recovery
                            </SelectItem>
                            <SelectItem value="tax">Additional Tax</SelectItem>
                            <SelectItem value="other">
                              Other Deduction
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {deductionType !== "none" && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="deductionAmount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Deduction Amount (PKR)</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  value={field.value || 0}
                                  onChange={(e) =>
                                    field.onChange(
                                      parseFloat(e.target.value) || 0,
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="deductionReason"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Deduction Reason</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="e.g., Loan installment, Advance recovery..."
                                  value={field.value || ''}
                                  onChange={field.onChange}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </>
                  )}

                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <FormField
                      control={form.control}
                      name="isAdvance"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>Mark as Advance Payment</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>

                  {isAdvance && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-blue-50 rounded-lg">
                      <FormField
                        control={form.control}
                        name="advanceAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Advance Amount</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                value={field.value || 0}
                                onChange={(e) =>
                                  field.onChange(
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="remainingAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Remaining to Recover</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                readOnly
                                className="bg-gray-100"
                                value={
                                  (form.getValues("advanceAmount") || 0) -
                                  (form.getValues("deductionAmount") || 0)
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Tab 4: Payment History */}
              <TabsContent value="history" className="space-y-6">
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    Payment History
                  </h4>
                </div>

                {paymentHistory.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-3 text-left">Date</th>
                          <th className="p-3 text-left">Amount</th>
                          <th className="p-3 text-left">Mode</th>
                          <th className="p-3 text-left">Status</th>
                          <th className="p-3 text-left">Slip No</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paymentHistory.map((payment, index) => (
                          <tr
                            key={payment.id || index}
                            className="border-b hover:bg-gray-50"
                          >
                            <td className="p-3">
                              {new Date(
                                payment.paymentDate,
                              ).toLocaleDateString()}
                            </td>
                            <td className="p-3 font-medium">
                              PKR {payment.amount?.toLocaleString()}
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                {payment.paymentMode}
                              </span>
                            </td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  payment.status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : payment.status === "pending"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                }`}
                              >
                                {payment.status}
                              </span>
                            </td>
                            <td className="p-3 font-mono">{payment.slipNo}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No payment history found</p>
                  </div>
                )}
              </TabsContent>

              {/* Action Buttons */}
              <DialogFooter className="flex gap-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveAndPrint}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <Printer className="h-4 w-4" />
                  Save & Print Slip
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Processing..." : "Save Payment"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};