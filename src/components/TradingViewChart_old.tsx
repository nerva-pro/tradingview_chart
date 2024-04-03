import { useEffect, useRef } from 'react'
import { ResolutionString } from '../../public/tradingview/charting_library'
import useSystemTheme from "@/hooks/useSystemTheme";
import datafeed from '@/utils/datafeed'

const chartingLibraryPath = 'tradingview/charting_library/'

function getCurrentTimezoneName() {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return timeZone;
}

function TradingViewChart() {
  const systemTheme = useSystemTheme();
  useEffect(() => {
    if (typeof window !== 'undefined' && window.TradingView) {
      new window.TradingView.widget({
        container: 'tv_chart_container',
        locale: 'en',
        library_path: chartingLibraryPath,
        datafeed: datafeed,
        symbol: 'EURUSD',
        interval: '15' as ResolutionString,
        fullscreen: true,
        debug: false,
        load_last_chart: true,
        study_count_limit: 20,
        theme: systemTheme,
        symbol_search_request_delay: 1000,
        enabled_features: ["use_localstorage_for_settings","display_legend_on_all_charts","show_exchange_logos","items_favoriting","pricescale_currency","show_dom_first_time","show_right_widgets_panel_by_default",
                            "show_symbol_logos","show_zoom_and_move_buttons_on_touch","snapshot_trading_drawings","show_percent_option_for_right_margin","snapshot_trading_drawings",
                            "use_na_string_for_not_available_values","confirm_overwrite_if_chart_layout_with_name_exists","create_volume_indicator_by_default",
                            "end_of_period_timescale_marks","side_toolbar_in_fullscreen_mode","create_volume_indicator_by_default_once","custom_resolutions","header_in_fullscreen_mode",
                            "iframe_loading_compatibility_mode","side_toolbar_in_fullscreen_mode","study_symbol_ticker_description","volume_force_overlay",
                            "show_symbol_logo_in_legend","chart_style_hilo","save_chart_properties_to_local_storage","countdown","charting_library_debug_mode",
                            "move_logo_to_main_pane","disable_resolution_rebuild","end_of_period_timescale_marks"],
        disabled_features: ["hide_main_series_symbol_from_indicator_legend","display_market_status","header_saveload","chart_template_storage","study_templates"]
                                    
      });
    }
  }, [])

  return <div id="tv_chart_container" />
}

export default TradingViewChart