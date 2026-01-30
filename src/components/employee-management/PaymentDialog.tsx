'use client';

import React, { useState } from 'react';
import { Printer, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { apiRequest } from '@/lib/api-request';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';

const paymentSchema = z.object({
  amount: z.number().min(1, 'Amount must be greater than 0'),
  paymentMode: z.enum(['bank', 'cash', 'other']),
  paymentDetails: z.string().optional(),
  screenshot: z.instanceof(File).optional(),
  slipNo: z.string(),
  paymentDate: z.string(),
  receiptDate: z.string(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentDialogProps {
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

export const PaymentDialog: React.FC<PaymentDialogProps> = ({
  employee,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [generatedSlipNo, setGeneratedSlipNo] = useState(
    `SLIP-${Date.now().toString().slice(-8)}`
  );

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: employee.salary + employee.incentive - employee.taxAmount,
      paymentMode: 'bank',
      paymentDetails: '',
      slipNo: generatedSlipNo,
      paymentDate: new Date().toISOString().split('T')[0],
      receiptDate: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = async (data: PaymentFormData) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('employeeId', employee.id);
      formData.append('amount', data.amount.toString());
      formData.append('paymentMode', data.paymentMode);
      formData.append('paymentDetails', data.paymentDetails || '');
      formData.append('slipNo', data.slipNo);
      formData.append('paymentDate', data.paymentDate);
      formData.append('receiptDate', data.receiptDate);
      
      if (screenshotFile) {
        formData.append('screenshot', screenshotFile);
      }

      const response = await apiRequest('/api/payments', {
        method: 'POST',
        body: formData,
      });

      if (response.success) {
       toast.success('Payment recorded successfully')
        onSuccess();
      } else {
        toast.error(response.message || 'Failed to record payment')
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      toast.error('Failed to record payment')
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndPrint = async () => {
    await form.handleSubmit(onSubmit)();
    // After saving, trigger print
    if (!form.formState.errors.amount) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshotFile(file);
    }
  };

  const calculateNetAmount = () => {
    const salary = employee.salary;
    const incentive = employee.incentive;
    const tax = employee.taxAmount;
    return salary + incentive - tax;
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Make Payment</DialogTitle>
          <p className="text-sm text-gray-500">
            {employee.fullName} ({employee.rollNo})
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Salary Breakdown */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3">Salary Breakdown</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Basic Salary</p>
                  <p className="font-semibold">PKR {employee.salary.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Incentive</p>
                  <p className="font-semibold text-green-600">
                    + PKR {employee.incentive.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tax Deduction</p>
                  <p className="font-semibold text-red-600">
                    - PKR {employee.taxAmount.toLocaleString()}
                  </p>
                </div>
                <div className="col-span-2 border-t pt-3">
                  <p className="text-sm text-gray-600">Net Payable Amount</p>
                  <p className="text-xl font-bold">
                    PKR {calculateNetAmount().toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (PKR) *</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number"
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select mode" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="bank">Bank Transfer</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
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
                  <FormLabel>Payment Details</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      rows={3}
                      placeholder="Bank account details, transaction ID, or any notes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="slipNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slip No *</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly />
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
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="receiptDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Receipt Date</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" readOnly />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Screenshot Upload */}
            <div>
              <FormLabel>Screenshot Upload</FormLabel>
              <div className="mt-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                {screenshotFile && (
                  <p className="text-sm text-gray-600 mt-2">
                    Selected: {screenshotFile.name}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Close
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveAndPrint}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Printer className="h-4 w-4" />
                Save & Print
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Payment'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};