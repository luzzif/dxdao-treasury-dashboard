import { ResponsivePie } from '@nivo/pie'

interface PieChartProps {
  data: {
    id: string
    value: number
  }[]
}

export const PieChart = ({ data }: PieChartProps) => <ResponsivePie data={data} />
