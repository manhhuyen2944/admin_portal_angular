export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface ChartSeries {
  name: string;
  color?: string;
  data: number[];
}
