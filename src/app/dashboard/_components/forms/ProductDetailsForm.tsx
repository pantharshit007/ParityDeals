"use client";

import { ProductDetailsSchema } from "@/data/types/zod-type";
import React from "react";
import { useForm } from "react-hook-form";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createProductAction, updateProductAction } from "@/server/actions/products";
import { toast } from "sonner";
import { ProductType } from "@/data/types/type";
import { RequiredLabelIcon } from "@/components/RequiredLabelIcon";

function ProductDetailsForm({ product }: { product?: ProductType }) {
  const form = useForm<z.infer<typeof ProductDetailsSchema>>({
    resolver: zodResolver(ProductDetailsSchema),
    defaultValues: {
      name: product?.name ?? "",
      url: product?.url ?? "",
      description: product?.description ?? "",
    },
  });

  async function handleSubmit(values: z.infer<typeof ProductDetailsSchema>) {
    if (product) {
      if (
        values.name === product.name &&
        values.url === product.url &&
        values.description === product.description
      ) {
        toast.info("No changes detected");
        return;
      }
    }

    const action =
      product === null ? createProductAction : updateProductAction.bind(null, product!.id);

    const res = await action(values);
    if (res?.error) {
      toast.error(res.message);
      console.log("Error in creating product", res.message);
    }

    toast.success("Product created!");
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-4">
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Name
                    <RequiredLabelIcon />
                  </FormLabel>

                  <FormControl>
                    <Input {...field} placeholder="Enter Name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Enter your website URL
                    <RequiredLabelIcon />
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    Include the protocol (http/https) and the full path to the sales page
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea className="min-h-20 resize-none" {...field} />
                </FormControl>

                <FormDescription>
                  An optional description to help distinguish your product from other products
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="self-end">
            <Button disabled={form.formState.isSubmitting} type="submit">
              Save
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}

export default ProductDetailsForm;
