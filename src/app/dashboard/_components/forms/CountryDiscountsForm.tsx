"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Image from "next/image";

import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateCountryDiscountsAction } from "@/server/actions/products";
import { CountryGrpsType } from "@/data/types/type";
import { productCountryDiscountsSchema } from "@/data/types/zod-type";
import { toast } from "sonner";

interface CountryDiscountsFormProps {
  productId: string;
  countryGroups: CountryGrpsType[];
}

export function CountryDiscountsForm({ productId, countryGroups }: CountryDiscountsFormProps) {
  const form = useForm<z.infer<typeof productCountryDiscountsSchema>>({
    resolver: zodResolver(productCountryDiscountsSchema),
    defaultValues: {
      groups: countryGroups.map((grp) => {
        const discount = grp.discount?.discountPercentage ?? grp.recommendedDiscountPercentage;

        return {
          countryGroupId: grp.id,
          coupon: grp.discount?.coupon ?? "",
          discountPercentage: discount != null ? discount * 100 : undefined,
        };
      }),
    },
  });

  async function onSubmit(values: z.infer<typeof productCountryDiscountsSchema>) {
    const data = await updateCountryDiscountsAction(productId, values);
    if (data.error) {
      toast.error(data.message);
      return;
    }

    toast.success(data.message);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-6 flex-col">
        {countryGroups.map((grp, index) => (
          <Card key={grp.id}>
            <CardContent className="pt-6 flex gap-16 items-center">
              <div>
                <h2 className="text-muted-foreground text-sm font-semibold mb-2">{grp.name}</h2>
                <div className="flex gap-2 flex-wrap">
                  {grp.countries.map((country) => (
                    <Image
                      key={country.code}
                      width={24}
                      height={16}
                      alt={country.name}
                      title={country.name}
                      src={`http://purecatamphetamine.github.io/country-flag-icons/3x2/${country.code.toUpperCase()}.svg`}
                      className="border"
                    />
                  ))}
                </div>
              </div>

              <Input type="hidden" {...form.register(`groups.${index}.countryGroupId`)} />

              <div className="ml-auto flex-shrink-0 flex gap-2 flex-col w-min">
                <div className="flex gap-4">
                  <FormField
                    control={form.control}
                    name={`groups.${index}.discountPercentage`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount %</FormLabel>
                        <FormControl>
                          <Input
                            className="w-24"
                            {...field}
                            type="number"
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.valueAsNumber)}
                            min="0"
                            max="100"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`groups.${index}.coupon`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Coupon</FormLabel>
                        <FormControl>
                          <Input className="w-48" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormMessage>{form.formState.errors.groups?.[index]?.root?.message}</FormMessage>
              </div>
            </CardContent>
          </Card>
        ))}

        <div className="self-end">
          <Button disabled={form.formState.isSubmitting} type="submit">
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
}
