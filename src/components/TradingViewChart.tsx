import { useEffect } from 'react'
import { ResolutionString } from '../../public/tradingview/charting_library'
import useSystemTheme from "@/hooks/useSystemTheme";
import datafeed from '@/utils/datafeed'
import moment from 'moment-timezone';

const chartingLibraryPath = 'tradingview/charting_library/'
function getMachineId() {
    
  let machineId = localStorage.getItem('MachineId');
  
  if (!machineId) {
      machineId = crypto.randomUUID();
      localStorage.setItem('MachineId', machineId);
  }

  return machineId;
}


function getCurrentTimezoneName() {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return timeZone;
}


function TradingViewChart() {
  const systemTheme = useSystemTheme();
  useEffect(() => {
    if (typeof window !== 'undefined' && window.TradingView) {
      moment.tz.setDefault('Etc/UTC');
      new window.TradingView.widget({
        container: 'tv_chart_container',
        locale: 'en',
        library_path: chartingLibraryPath,
        datafeed: datafeed,
        symbol: 'BTCUSDT',
        interval: '15' as ResolutionString,
        fullscreen: true,
        debug: false,
        load_last_chart: true,
        study_count_limit: 200,
        theme: systemTheme,
        symbol_search_request_delay: 100,
        charts_storage_url: "https://saveload.nerva.pro",
        charts_storage_api_version: "1.1",
        client_id: "nerva",
        user_id: getMachineId(),
        header_widget_buttons_mode: 'fullsize',
        auto_save_delay: 10,
        timezone: "Etc/UTC",
        overrides:{"mainSeriesProperties.showCountdown" : true},
        widgetbar: { 
          details: true,
          watchlist: true,
          news: true,
          datawindow: true,
          watchlist_settings: { default_symbols: [] },
        },
        enabled_features: ["save_chart_properties_to_local_storage","use_localstorage_for_settings","display_legend_on_all_charts","show_exchange_logos","items_favoriting","pricescale_currency","show_dom_first_time","show_right_widgets_panel_by_default",
                            "show_symbol_logos","show_zoom_and_move_buttons_on_touch","snapshot_trading_drawings","show_percent_option_for_right_margin","snapshot_trading_drawings","pricescale_unit","fix_left_edge","tick_resolution",
                            "use_na_string_for_not_available_values","confirm_overwrite_if_chart_layout_with_name_exists","create_volume_indicator_by_default","symbol_info_price_source",
                            "end_of_period_timescale_marks","side_toolbar_in_fullscreen_mode","create_volume_indicator_by_default_once","header_in_fullscreen_mode","chart_template_storage",
                            "iframe_loading_compatibility_mode","side_toolbar_in_fullscreen_mode","study_symbol_ticker_description","volume_force_overlay","datasource_copypaste",
                            "show_symbol_logo_in_legend","chart_style_hilo","save_chart_properties_to_local_storage","charting_library_debug_mode","disable_resolution_rebuild",
                            "move_logo_to_main_pane","header_saveload","study_templates","countdown"],
        disabled_features: ["hide_main_series_symbol_from_indicator_legend","display_market_status","custom_resolutions"]
                            
      });
    }
  }, [systemTheme])

  return <div id="tv_chart_container" /> as JSX.Element;
}

export default TradingViewChart