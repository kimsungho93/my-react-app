import React, { useMemo } from "react";
import { Box, Paper, Typography, useTheme } from "@mui/material";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import type { DepartmentBudget } from "../../../types/dashboard.types";

interface BudgetDonutChartProps {
  data: DepartmentBudget | null;
  onDoubleClick?: () => void;
}

/**
 * 부서 회식비 도넛 차트 컴포넌트
 * 사용 금액과 잔여 금액을 도넛 차트로 시각화
 * 더블클릭 시 사용 이력 모달 오픈
 */
export const BudgetDonutChart = React.memo<BudgetDonutChartProps>(
  ({ data, onDoubleClick }) => {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === "dark";

    // ECharts 옵션 메모이제이션
    const chartOption = useMemo<EChartsOption>(() => {
      if (!data) return {};

      const usedAmount = data.totalAmount - data.remainingAmount;
      const usedPercent = (
        (usedAmount / data.totalAmount) *
        100
      ).toFixed(1);

      return {
        tooltip: {
          trigger: "item",
          formatter: "{a} <br/>{b}: {c}원 ({d}%)",
        },
        legend: {
          orient: "horizontal",
          bottom: "2%",
          left: "center",
          textStyle: {
            fontSize: 11,
            color: isDarkMode ? "#E0E0E0" : "#666",
          },
          itemGap: 16,
        },
        title: {
          text: "SI 사업부",
          left: "center",
          top: "8%",
          textStyle: {
            fontSize: 15,
            fontWeight: "bold",
            color: isDarkMode ? "#FFFFFF" : "#333",
          },
        },
        series: [
          {
            name: "회식비",
            type: "pie",
            radius: ["48%", "85%"],
            center: ["50%", "48%"],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 8,
              borderColor: isDarkMode ? "#424242" : "#fff",
              borderWidth: 2,
            },
            label: {
              show: true,
              position: "center",
              formatter: () => {
                return `{b|${data.year}년 ${data.month}월}\n{c|${usedPercent}% 사용}`;
              },
              rich: {
                b: {
                  fontSize: 13,
                  color: isDarkMode ? "#B0B0B0" : "#999",
                  lineHeight: 20,
                  fontWeight: 500,
                },
                c: {
                  fontSize: 14,
                  color: isDarkMode ? "#FFFFFF" : "#333",
                  lineHeight: 22,
                  fontWeight: 600,
                },
              },
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 16,
                fontWeight: "bold",
              },
            },
            labelLine: {
              show: false,
            },
            data: [
              {
                value: usedAmount,
                name: "사용 금액",
                itemStyle: {
                  color: "#FF6B6B",
                },
              },
              {
                value: data.remainingAmount,
                name: "잔여 금액",
                itemStyle: {
                  color: "#51CF66",
                },
              },
            ],
          },
        ],
      };
    }, [data, isDarkMode]);

    if (!data) {
      return (
        <Paper sx={{ p: 3, textAlign: "center", height: "100%" }}>
          <Typography variant="body2" color="text.secondary">
            회식비 데이터를 불러올 수 없습니다
          </Typography>
        </Paper>
      );
    }

    return (
      <Box
        onDoubleClick={onDoubleClick}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          cursor: onDoubleClick ? "pointer" : "default",
        }}
      >
        {/* 차트 */}
        <Box sx={{ height: 400, mb: 1 }}>
          <ReactECharts
            option={chartOption}
            style={{ height: "100%", width: "100%" }}
            opts={{ renderer: "canvas" }}
          />
        </Box>

        {/* 상세 정보 */}
        <Box sx={{ pt: 2, borderTop: 1, borderColor: "divider" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              총 예산
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {data.totalAmount.toLocaleString()}원
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              사용 금액
            </Typography>
            <Typography variant="body2" fontWeight={600} color="error.main">
              {(data.totalAmount - data.remainingAmount).toLocaleString()}원
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" color="text.secondary">
              잔여 금액
            </Typography>
            <Typography variant="body2" fontWeight={600} color="success.main">
              {data.remainingAmount.toLocaleString()}원
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  }
);

BudgetDonutChart.displayName = "BudgetDonutChart";
