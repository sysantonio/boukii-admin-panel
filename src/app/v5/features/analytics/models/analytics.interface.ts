import { Season } from '../../../core/models/season.interface';

// ==================== BASE ANALYTICS INTERFACES ====================

export interface AnalyticsTimeRange {
  start_date: Date;
  end_date: Date;
  timezone: string;
  granularity: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
}

export interface AnalyticsFilter {
  season_ids?: number[];
  location_ids?: number[];
  course_group_ids?: number[];
  monitor_ids?: number[];
  client_ids?: number[];
  age_range?: { min: number; max: number };
  booking_status?: string[];
  payment_status?: string[];
  custom_filters?: { [key: string]: any };
}

export interface AnalyticsMetric {
  metric_id: string;
  metric_name: string;
  value: number;
  unit: string;
  change_from_previous: number;
  change_percentage: number;
  trend: 'up' | 'down' | 'stable';
  confidence_level: number;
  data_points: number;
}

export interface AnalyticsDataPoint {
  timestamp: Date;
  value: number;
  label: string;
  metadata?: { [key: string]: any };
}

export interface AnalyticsTimeSeriesData {
  metric_id: string;
  metric_name: string;
  data_points: AnalyticsDataPoint[];
  trend_line?: { slope: number; intercept: number; r_squared: number };
  seasonal_patterns?: SeasonalPattern[];
  forecasting?: ForecastingData;
}

export interface SeasonalPattern {
  pattern_type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  peak_times: { label: string; value: number; confidence: number }[];
  low_times: { label: string; value: number; confidence: number }[];
  cyclical_strength: number;
}

export interface ForecastingData {
  method: 'linear' | 'exponential' | 'seasonal' | 'arima';
  predictions: AnalyticsDataPoint[];
  confidence_intervals: {
    upper: AnalyticsDataPoint[];
    lower: AnalyticsDataPoint[];
  };
  accuracy_metrics: {
    mae: number; // Mean Absolute Error
    mape: number; // Mean Absolute Percentage Error
    rmse: number; // Root Mean Square Error
  };
}

// ==================== REVENUE ANALYTICS ====================

export interface RevenueAnalytics {
  total_revenue: AnalyticsMetric;
  revenue_by_period: AnalyticsTimeSeriesData;
  revenue_by_course_group: CourseGroupRevenue[];
  revenue_by_location: LocationRevenue[];
  revenue_by_payment_method: PaymentMethodRevenue[];
  average_booking_value: AnalyticsMetric;
  revenue_per_participant: AnalyticsMetric;
  refund_rate: AnalyticsMetric;
  outstanding_payments: AnalyticsMetric;
  seasonal_revenue_comparison: SeasonalRevenueComparison[];
  profit_margins: ProfitMarginAnalysis;
}

export interface CourseGroupRevenue {
  course_group_id: number;
  course_group_name: string;
  total_revenue: number;
  participant_count: number;
  average_price_per_participant: number;
  growth_rate: number;
  market_share_percentage: number;
  profitability_score: number;
}

export interface LocationRevenue {
  location_id: number;
  location_name: string;
  total_revenue: number;
  booking_count: number;
  average_revenue_per_booking: number;
  occupancy_rate: number;
  seasonal_variations: { [season: string]: number };
}

export interface PaymentMethodRevenue {
  payment_method: string;
  transaction_count: number;
  total_amount: number;
  average_transaction_value: number;
  success_rate: number;
  processing_fees: number;
  net_revenue: number;
}

export interface SeasonalRevenueComparison {
  season_id: number;
  season_name: string;
  current_revenue: number;
  previous_year_revenue: number;
  growth_percentage: number;
  booking_count: number;
  average_booking_value: number;
  peak_month: string;
  peak_month_revenue: number;
}

export interface ProfitMarginAnalysis {
  gross_profit_margin: number;
  net_profit_margin: number;
  cost_breakdown: {
    monitor_costs: number;
    facility_costs: number;
    equipment_costs: number;
    administrative_costs: number;
    marketing_costs: number;
    other_costs: number;
  };
  margin_by_course_group: { course_group_id: number; margin: number }[];
  margin_trends: AnalyticsTimeSeriesData;
}

// ==================== BOOKING ANALYTICS ====================

export interface BookingAnalytics {
  total_bookings: AnalyticsMetric;
  bookings_by_period: AnalyticsTimeSeriesData;
  booking_status_distribution: BookingStatusDistribution[];
  conversion_funnel: ConversionFunnelData;
  cancellation_analytics: CancellationAnalytics;
  rebooking_analytics: RebookingAnalytics;
  seasonal_booking_patterns: SeasonalBookingPatterns;
  booking_lead_time_analysis: LeadTimeAnalysis;
  group_size_analytics: GroupSizeAnalytics;
  booking_source_analytics: BookingSourceAnalytics;
}

export interface BookingStatusDistribution {
  status: string;
  count: number;
  percentage: number;
  revenue_impact: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface ConversionFunnelData {
  stages: ConversionStage[];
  overall_conversion_rate: number;
  drop_off_points: { stage: string; drop_off_rate: number }[];
  optimization_opportunities: string[];
}

export interface ConversionStage {
  stage_name: string;
  stage_order: number;
  visitors: number;
  conversions: number;
  conversion_rate: number;
  time_spent_average: number;
  bounce_rate: number;
}

export interface CancellationAnalytics {
  cancellation_rate: AnalyticsMetric;
  cancellation_reasons: { reason: string; count: number; percentage: number }[];
  cancellation_timing: { days_before_course: number; count: number }[];
  revenue_loss: number;
  patterns_by_demographics: DemographicCancellationPattern[];
  refund_processing_metrics: RefundMetrics;
}

export interface RebookingAnalytics {
  rebooking_rate: AnalyticsMetric;
  time_between_bookings: AnalyticsTimeSeriesData;
  course_switching_patterns: CourseSwitchingPattern[];
  seasonal_rebooking_trends: { season: string; rebooking_rate: number }[];
  loyalty_correlation: number;
}

export interface SeasonalBookingPatterns {
  peak_seasons: { season: string; booking_multiplier: number }[];
  weekly_patterns: { day_of_week: string; booking_index: number }[];
  daily_patterns: { hour: number; booking_percentage: number }[];
  holiday_impact: { holiday: string; booking_change: number }[];
  weather_correlation: { condition: string; booking_impact: number }[];
}

export interface LeadTimeAnalysis {
  average_lead_time_days: number;
  lead_time_distribution: { days_range: string; percentage: number }[];
  lead_time_by_course_group: { course_group: string; avg_lead_time: number }[];
  last_minute_booking_rate: number;
  early_bird_booking_rate: number;
  optimal_booking_window: { start_days: number; end_days: number };
}

export interface GroupSizeAnalytics {
  average_group_size: AnalyticsMetric;
  group_size_distribution: { size_range: string; count: number; percentage: number }[];
  capacity_utilization: AnalyticsMetric;
  group_size_by_course_type: { course_type: string; avg_size: number }[];
  solo_vs_group_trends: AnalyticsTimeSeriesData;
}

export interface BookingSourceAnalytics {
  source_distribution: { source: string; bookings: number; percentage: number; revenue: number }[];
  channel_effectiveness: { channel: string; conversion_rate: number; customer_ltv: number }[];
  referral_analytics: ReferralAnalytics;
  marketing_attribution: MarketingAttribution[];
}

// ==================== CLIENT ANALYTICS ====================

export interface ClientAnalytics {
  total_clients: AnalyticsMetric;
  new_clients_by_period: AnalyticsTimeSeriesData;
  client_retention_analysis: ClientRetentionAnalysis;
  client_lifetime_value: ClientLifetimeValueAnalysis;
  client_segmentation: ClientSegmentationAnalysis;
  client_satisfaction_metrics: ClientSatisfactionMetrics;
  client_demographics: ClientDemographicsAnalysis;
  client_behavior_patterns: ClientBehaviorAnalysis;
}

export interface ClientRetentionAnalysis {
  overall_retention_rate: AnalyticsMetric;
  retention_by_cohort: CohortRetentionData[];
  churn_rate: AnalyticsMetric;
  churn_prediction: ChurnPredictionData;
  retention_factors: RetentionFactor[];
  win_back_campaigns: WinBackCampaignData[];
}

export interface CohortRetentionData {
  cohort_month: string;
  initial_size: number;
  retention_periods: { period: number; retained_clients: number; retention_rate: number }[];
  lifetime_value: number;
  characteristics: { [key: string]: any };
}

export interface ChurnPredictionData {
  high_risk_clients: number;
  medium_risk_clients: number;
  low_risk_clients: number;
  churn_factors: { factor: string; importance: number; correlation: number }[];
  intervention_recommendations: string[];
}

export interface ClientLifetimeValueAnalysis {
  average_ltv: AnalyticsMetric;
  ltv_distribution: { value_range: string; client_count: number; percentage: number }[];
  ltv_by_segment: { segment: string; average_ltv: number; median_ltv: number }[];
  ltv_prediction_model: LTVPredictionModel;
  high_value_client_characteristics: { [characteristic: string]: any };
}

export interface ClientSegmentationAnalysis {
  segments: ClientSegment[];
  segment_performance: SegmentPerformanceMetrics[];
  segment_migration: SegmentMigrationData[];
  personalization_opportunities: PersonalizationOpportunity[];
}

export interface ClientSegment {
  segment_id: string;
  segment_name: string;
  client_count: number;
  percentage_of_total: number;
  characteristics: { [key: string]: any };
  behavior_patterns: { [pattern: string]: any };
  value_metrics: { revenue: number; bookings: number; ltv: number };
}

// ==================== MONITOR ANALYTICS ====================

export interface MonitorAnalytics {
  total_monitors: AnalyticsMetric;
  monitor_utilization: MonitorUtilizationAnalytics;
  monitor_performance: MonitorPerformanceAnalytics;
  monitor_availability: MonitorAvailabilityAnalytics;
  monitor_compensation: MonitorCompensationAnalytics;
  monitor_satisfaction: MonitorSatisfactionAnalytics;
  monitor_retention: MonitorRetentionAnalytics;
  monitor_skill_analysis: MonitorSkillAnalysis;
}

export interface MonitorUtilizationAnalytics {
  overall_utilization_rate: AnalyticsMetric;
  utilization_by_monitor: { monitor_id: number; monitor_name: string; utilization_rate: number }[];
  utilization_trends: AnalyticsTimeSeriesData;
  peak_utilization_times: { time_slot: string; average_utilization: number }[];
  underutilized_monitors: { monitor_id: number; utilization_rate: number; improvement_potential: number }[];
  optimal_staff_levels: OptimalStaffingData;
}

export interface MonitorPerformanceAnalytics {
  average_ratings: AnalyticsMetric;
  performance_distribution: { rating_range: string; monitor_count: number; percentage: number }[];
  performance_trends: AnalyticsTimeSeriesData;
  top_performers: { monitor_id: number; monitor_name: string; rating: number; bookings: number }[];
  performance_factors: { factor: string; correlation_with_rating: number }[];
  improvement_opportunities: PerformanceImprovementOpportunity[];
}

export interface MonitorAvailabilityAnalytics {
  average_availability_hours: AnalyticsMetric;
  availability_patterns: { day_of_week: string; average_hours: number }[];
  seasonal_availability_changes: { season: string; availability_change: number }[];
  last_minute_availability: AnalyticsMetric;
  availability_gaps: AvailabilityGap[];
  scheduling_conflicts: SchedulingConflictAnalysis;
}

// ==================== OPERATIONAL ANALYTICS ====================

export interface OperationalAnalytics {
  facility_utilization: FacilityUtilizationAnalytics;
  equipment_analytics: EquipmentAnalytics;
  capacity_planning: CapacityPlanningAnalytics;
  efficiency_metrics: EfficiencyMetrics;
  quality_metrics: QualityMetrics;
  safety_analytics: SafetyAnalytics;
}

export interface EquipmentAnalytics {
  total_equipment_count: AnalyticsMetric;
  equipment_utilization_rate: AnalyticsMetric;
  equipment_by_type: { equipment_type: string; count: number; utilization_rate: number; maintenance_cost: number }[];
  maintenance_analytics: EquipmentMaintenanceAnalytics;
  replacement_schedule: EquipmentReplacementData[];
  equipment_performance: EquipmentPerformanceMetrics[];
  cost_analysis: EquipmentCostAnalysis;
}

export interface EquipmentMaintenanceAnalytics {
  scheduled_maintenance_compliance: AnalyticsMetric;
  unplanned_maintenance_rate: AnalyticsMetric;
  average_repair_time: AnalyticsMetric;
  maintenance_cost_trends: AnalyticsTimeSeriesData;
  equipment_downtime: AnalyticsMetric;
}

export interface EquipmentReplacementData {
  equipment_id: string;
  equipment_type: string;
  current_age: number;
  expected_lifespan: number;
  replacement_priority: 'low' | 'medium' | 'high';
  estimated_replacement_cost: number;
  recommended_replacement_date: Date;
}

export interface EquipmentPerformanceMetrics {
  equipment_id: string;
  equipment_type: string;
  performance_score: number;
  reliability_score: number;
  efficiency_rating: number;
  user_satisfaction: number;
  incident_count: number;
}

export interface EquipmentCostAnalysis {
  total_equipment_investment: number;
  annual_maintenance_cost: number;
  cost_per_usage_hour: number;
  roi_by_equipment_type: { equipment_type: string; roi: number; payback_period: number }[];
  cost_optimization_opportunities: string[];
}

export interface CapacityPlanningAnalytics {
  current_capacity_utilization: AnalyticsMetric;
  capacity_by_location: { location_id: number; location_name: string; current_capacity: number; utilization_rate: number }[];
  capacity_by_time_period: { period: string; capacity_demand: number; available_capacity: number; utilization_rate: number }[];
  capacity_constraints: CapacityConstraint[];
  capacity_forecasting: CapacityForecastData;
  expansion_recommendations: CapacityExpansionRecommendation[];
}

export interface CapacityForecastData {
  forecast_periods: { period: string; predicted_demand: number; confidence_interval: number }[];
  seasonal_capacity_needs: { season: string; additional_capacity_needed: number }[];
  growth_projections: { timeframe: string; capacity_growth_needed: number; investment_required: number }[];
}

export interface CapacityExpansionRecommendation {
  location_id: number;
  expansion_type: 'facility' | 'equipment' | 'staffing';
  recommended_capacity_increase: number;
  investment_required: number;
  expected_roi: number;
  implementation_timeline: string;
  priority: 'low' | 'medium' | 'high';
}

export interface FacilityUtilizationAnalytics {
  overall_utilization_rate: AnalyticsMetric;
  utilization_by_location: { location_id: number; location_name: string; utilization_rate: number }[];
  peak_usage_times: { time_slot: string; utilization_rate: number }[];
  seasonal_utilization_patterns: { season: string; utilization_rate: number }[];
  capacity_constraints: CapacityConstraint[];
  expansion_opportunities: ExpansionOpportunity[];
}

// ==================== DASHBOARD INTERFACES ====================

export interface AnalyticsDashboard {
  dashboard_id: string;
  dashboard_name: string;
  description?: string;
  widgets: AnalyticsWidget[];
  layout: DashboardLayout;
  filters: AnalyticsFilter;
  time_range: AnalyticsTimeRange;
  auto_refresh_interval?: number;
  created_by: number;
  created_at: Date;
  last_modified: Date;
  is_public: boolean;
  tags: string[];
}

export interface AnalyticsWidget {
  widget_id: string;
  widget_type: 'metric' | 'chart' | 'table' | 'map' | 'gauge' | 'progress' | 'text';
  title: string;
  description?: string;
  data_source: string;
  configuration: WidgetConfiguration;
  position: { x: number; y: number; width: number; height: number };
  is_visible: boolean;
  refresh_rate?: number;
}

export interface WidgetConfiguration {
  chart_type?: 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'scatter' | 'heatmap';
  metrics: string[];
  dimensions: string[];
  filters?: AnalyticsFilter;
  color_scheme?: string;
  show_legend?: boolean;
  show_values?: boolean;
  format_type?: 'number' | 'currency' | 'percentage' | 'date' | 'duration';
  threshold_lines?: { value: number; color: string; label: string }[];
  comparison_enabled?: boolean;
  comparison_period?: 'previous_period' | 'previous_year' | 'custom';
}

export interface DashboardLayout {
  grid_size: { columns: number; rows: number };
  responsive_breakpoints: { [breakpoint: string]: number };
  theme: 'light' | 'dark' | 'auto';
  background_color?: string;
  border_style?: string;
}

// ==================== EXPORT AND REPORTING ====================

export interface AnalyticsReport {
  report_id: string;
  report_name: string;
  report_type: 'scheduled' | 'on_demand' | 'automated';
  sections: ReportSection[];
  filters: AnalyticsFilter;
  time_range: AnalyticsTimeRange;
  format: 'pdf' | 'excel' | 'csv' | 'json';
  recipients: string[];
  schedule?: ReportSchedule;
  template_id?: string;
  created_by: number;
  created_at: Date;
}

export interface ReportSection {
  section_id: string;
  section_name: string;
  section_type: 'summary' | 'detailed' | 'chart' | 'table' | 'text';
  content: ReportContent;
  page_break_before?: boolean;
  styling?: ReportStyling;
}

export interface ReportStyling {
  font_family?: string;
  font_size?: number;
  font_weight?: 'normal' | 'bold' | 'light';
  color?: string;
  background_color?: string;
  border?: string;
  margin?: string;
  padding?: string;
  text_align?: 'left' | 'center' | 'right' | 'justify';
  header_styling?: {
    font_size?: number;
    font_weight?: 'normal' | 'bold' | 'light';
    color?: string;
    background_color?: string;
  };
  table_styling?: {
    border_style?: string;
    header_background?: string;
    alternating_row_colors?: boolean;
    column_widths?: number[];
  };
}

export interface ReportContent {
  title?: string;
  description?: string;
  data?: any;
  chart_config?: WidgetConfiguration;
  table_config?: TableConfiguration;
  text_content?: string;
  insights?: string[];
  recommendations?: string[];
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  day_of_week?: number;
  day_of_month?: number;
  time: string;
  timezone: string;
  is_active: boolean;
  next_run: Date;
  last_run?: Date;
}

// ==================== HELPER INTERFACES ====================

export interface DemographicCancellationPattern {
  demographic_group: string;
  cancellation_rate: number;
  primary_reasons: string[];
  time_patterns: { days_before: number; frequency: number }[];
}

export interface CourseSwitchingPattern {
  from_course_group: string;
  to_course_group: string;
  frequency: number;
  reasons: string[];
  success_rate: number;
}

export interface RefundMetrics {
  total_refunds: number;
  refund_amount: number;
  processing_time_average: number;
  refund_reasons: { reason: string; count: number }[];
}

export interface ReferralAnalytics {
  total_referrals: number;
  referral_conversion_rate: number;
  top_referrers: { client_id: number; referral_count: number; conversion_rate: number }[];
  referral_program_effectiveness: number;
}

export interface MarketingAttribution {
  campaign_name: string;
  channel: string;
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
  revenue: number;
  roi: number;
}

export interface RetentionFactor {
  factor_name: string;
  impact_score: number;
  correlation: number;
  actionable: boolean;
  recommendations: string[];
}

export interface WinBackCampaignData {
  campaign_id: string;
  target_segment: string;
  response_rate: number;
  reactivation_rate: number;
  roi: number;
}

export interface LTVPredictionModel {
  model_type: string;
  accuracy: number;
  factors: { factor: string; weight: number }[];
  confidence_interval: number;
  last_trained: Date;
}

export interface SegmentPerformanceMetrics {
  segment_id: string;
  revenue_per_client: number;
  booking_frequency: number;
  retention_rate: number;
  satisfaction_score: number;
  growth_rate: number;
}

export interface SegmentMigrationData {
  from_segment: string;
  to_segment: string;
  migration_rate: number;
  triggers: string[];
  timeline_average: number;
}

export interface PersonalizationOpportunity {
  segment_id: string;
  opportunity_type: string;
  potential_impact: number;
  implementation_effort: 'low' | 'medium' | 'high';
  expected_roi: number;
}

export interface OptimalStaffingData {
  time_periods: { period: string; recommended_monitors: number; current_monitors: number }[];
  shortage_periods: { period: string; shortage_count: number; impact: string }[];
  overstaffing_periods: { period: string; excess_count: number; cost_impact: number }[];
}

export interface PerformanceImprovementOpportunity {
  monitor_id: number;
  monitor_name: string;
  current_rating: number;
  potential_rating: number;
  improvement_areas: string[];
  recommended_actions: string[];
  expected_impact: number;
}

export interface AvailabilityGap {
  time_slot: string;
  demand_level: number;
  available_monitors: number;
  gap_size: number;
  impact_score: number;
  recommendations: string[];
}

export interface SchedulingConflictAnalysis {
  total_conflicts: number;
  conflict_types: { type: string; count: number; resolution_time_avg: number }[];
  resolution_success_rate: number;
  prevention_opportunities: string[];
}

export interface CapacityConstraint {
  location_id: number;
  constraint_type: 'space' | 'equipment' | 'staffing';
  severity: 'low' | 'medium' | 'high';
  impact: string;
  resolution_options: string[];
}

export interface ExpansionOpportunity {
  location_id?: number;
  opportunity_type: 'new_location' | 'capacity_increase' | 'equipment_upgrade';
  potential_revenue: number;
  investment_required: number;
  payback_period: number;
  risk_level: 'low' | 'medium' | 'high';
}

export interface EfficiencyMetrics {
  booking_processing_time: AnalyticsMetric;
  response_time_to_inquiries: AnalyticsMetric;
  schedule_optimization_score: AnalyticsMetric;
  resource_waste_percentage: AnalyticsMetric;
  automation_rate: AnalyticsMetric;
}

export interface QualityMetrics {
  client_satisfaction_score: AnalyticsMetric;
  service_quality_rating: AnalyticsMetric;
  complaint_resolution_time: AnalyticsMetric;
  repeat_client_rate: AnalyticsMetric;
  quality_incidents: AnalyticsMetric;
}

export interface SafetyAnalytics {
  incident_rate: AnalyticsMetric;
  safety_training_compliance: AnalyticsMetric;
  equipment_safety_scores: { equipment_type: string; safety_score: number }[];
  safety_improvement_trends: AnalyticsTimeSeriesData;
  risk_assessments: RiskAssessment[];
}

export interface RiskAssessment {
  risk_id: string;
  risk_category: string;
  probability: number;
  impact: number;
  risk_score: number;
  mitigation_measures: string[];
  status: 'open' | 'mitigated' | 'accepted';
}

export interface TableConfiguration {
  columns: { key: string; title: string; width?: number; sortable?: boolean }[];
  pagination?: { page_size: number; show_pagination: boolean };
  search_enabled?: boolean;
  export_enabled?: boolean;
  row_styling?: { [condition: string]: string };
}

export interface ClientSatisfactionMetrics {
  overall_satisfaction_score: AnalyticsMetric;
  satisfaction_by_service: { service: string; score: number; response_count: number }[];
  satisfaction_trends: AnalyticsTimeSeriesData;
  nps_score: AnalyticsMetric;
  complaint_metrics: ComplaintMetrics;
  feedback_analysis: FeedbackAnalysis;
}

export interface ComplaintMetrics {
  total_complaints: number;
  complaint_categories: { category: string; count: number; resolution_rate: number }[];
  resolution_time_average: number;
  escalation_rate: number;
  repeat_complaint_rate: number;
}

export interface FeedbackAnalysis {
  sentiment_analysis: { positive: number; neutral: number; negative: number };
  common_themes: { theme: string; frequency: number; sentiment: number }[];
  improvement_suggestions: string[];
  satisfaction_drivers: { driver: string; impact: number }[];
}

export interface ClientDemographicsAnalysis {
  age_distribution: { age_range: string; count: number; percentage: number }[];
  gender_distribution: { gender: string; count: number; percentage: number }[];
  location_distribution: { location: string; count: number; percentage: number }[];
  occupation_trends: { occupation: string; count: number; growth_rate: number }[];
  income_segmentation: { income_range: string; count: number; spending_pattern: number }[];
}

export interface ClientBehaviorAnalysis {
  booking_patterns: { pattern: string; frequency: number; characteristics: string[] }[];
  seasonal_preferences: { season: string; booking_increase: number; preferred_activities: string[] }[];
  loyalty_indicators: { indicator: string; correlation_with_retention: number }[];
  engagement_metrics: { channel: string; engagement_rate: number; effectiveness: number }[];
  purchase_journey: PurchaseJourneyAnalysis;
}

export interface PurchaseJourneyAnalysis {
  journey_stages: { stage: string; average_time: number; drop_off_rate: number }[];
  touchpoints: { touchpoint: string; influence_score: number; satisfaction: number }[];
  conversion_paths: { path: string; frequency: number; conversion_rate: number }[];
  optimization_opportunities: { stage: string; potential_improvement: number; effort_required: string }[];
}

export interface MonitorCompensationAnalytics {
  total_compensation_cost: AnalyticsMetric;
  average_hourly_rate: AnalyticsMetric;
  compensation_distribution: { rate_range: string; monitor_count: number; percentage: number }[];
  performance_vs_compensation: { performance_tier: string; average_compensation: number; retention_rate: number }[];
  compensation_trends: AnalyticsTimeSeriesData;
  bonus_effectiveness: BonusEffectivenessAnalysis;
}

export interface BonusEffectivenessAnalysis {
  bonus_types: { type: string; frequency: number; average_amount: number; performance_impact: number }[];
  roi_on_bonuses: number;
  optimal_bonus_structure: { performance_level: string; recommended_bonus: number }[];
}

export interface MonitorSatisfactionAnalytics {
  overall_satisfaction_score: AnalyticsMetric;
  satisfaction_factors: { factor: string; importance: number; current_score: number; gap: number }[];
  satisfaction_by_tenure: { tenure_range: string; satisfaction_score: number }[];
  satisfaction_trends: AnalyticsTimeSeriesData;
  engagement_metrics: MonitorEngagementMetrics;
}

export interface MonitorEngagementMetrics {
  participation_in_training: number;
  feedback_responsiveness: number;
  initiative_taking_score: number;
  collaboration_rating: number;
  professional_development_engagement: number;
}

export interface MonitorRetentionAnalytics {
  retention_rate: AnalyticsMetric;
  turnover_rate: AnalyticsMetric;
  retention_by_tenure: { tenure_range: string; retention_rate: number }[];
  exit_reasons: { reason: string; frequency: number; preventable: boolean }[];
  retention_factors: RetentionFactor[];
  cost_of_turnover: TurnoverCostAnalysis;
}

export interface TurnoverCostAnalysis {
  recruitment_cost_per_hire: number;
  training_cost_per_monitor: number;
  productivity_loss_cost: number;
  total_annual_turnover_cost: number;
  roi_of_retention_programs: number;
}

export interface MonitorSkillAnalysis {
  skill_distribution: { skill: string; proficiency_avg: number; monitors_with_skill: number }[];
  skill_gaps: { skill: string; current_level: number; required_level: number; gap_size: number }[];
  training_effectiveness: { training_program: string; skill_improvement: number; completion_rate: number }[];
  certification_analytics: CertificationAnalytics;
  skill_development_trends: AnalyticsTimeSeriesData;
}

export interface CertificationAnalytics {
  certification_completion_rates: { certification: string; completion_rate: number; impact_on_performance: number }[];
  certification_roi: { certification: string; cost: number; benefit: number; roi: number }[];
  upcoming_expiries: { certification: string; monitors_affected: number; renewal_rate: number }[];
}