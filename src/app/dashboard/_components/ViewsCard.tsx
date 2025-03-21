import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getViewsByCountryChartData,
  getViewsByDayChartData,
  getViewsByPPPChartData,
} from "@/server/db-queries/productViews";
import ViewsByCountryChart from "./charts/ViewsByCountryChart";
import { ViewsCountryChartType } from "@/data/types/type";
import ViewsByPPPChart from "./charts/ViewsByPPPChart";
import ViewsByDayChart from "./charts/ViewsByDayChart";
import { getProducts } from "@/server/db-queries/products";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { createURL } from "@/lib/utils";

export async function ViewsByDayCard(props: Parameters<typeof getViewsByDayChartData>[0]) {
  const chartData = await getViewsByDayChartData(props);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visitors Per Day</CardTitle>
      </CardHeader>
      <CardContent>{<ViewsByDayChart chartData={chartData} />}</CardContent>
    </Card>
  );
}

export async function ViewsByPPPCard(props: Parameters<typeof getViewsByPPPChartData>[0]) {
  const chartData = await getViewsByPPPChartData(props);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visitors Per PPP Group</CardTitle>
      </CardHeader>
      <CardContent>{<ViewsByPPPChart chartData={chartData} />}</CardContent>
    </Card>
  );
}

export async function ViewsByCountryCard(props: ViewsCountryChartType) {
  const chartData = await getViewsByCountryChartData(props);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visitors Per Country</CardTitle>
      </CardHeader>
      <CardContent>{<ViewsByCountryChart chartData={chartData} />}</CardContent>
    </Card>
  );
}

export async function ProductDropdown({
  userId,
  selectedProductId,
  searchParams,
}: {
  userId: string;
  selectedProductId: string | undefined;
  searchParams: Record<string, string>;
}) {
  const products = await getProducts(userId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          {products.find((product) => product.id === selectedProductId)?.name ?? "All Products"}
          <ChevronDown className="size-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem asChild>
          <Link href={createURL("/dashboard/analytics", searchParams, { productId: undefined })}>
            All Products
          </Link>
        </DropdownMenuItem>

        {products.map((product) => (
          <DropdownMenuItem asChild key={product.id}>
            <Link href={createURL("/dashboard/analytics", searchParams, { productId: product.id })}>
              {product.name}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
