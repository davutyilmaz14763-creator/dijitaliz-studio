#!/usr/bin/env bash
# Downloads the curated Mixkit SFX set (Mixkit Sound Effects Free License: commercial + social OK,
# no attribution needed) into public/sfx/ as 48 kHz stereo WAV, leading silence trimmed, peak -1 dBFS.
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=public/sfx; TMP=$(mktemp -d); mkdir -p "$OUT"
LIST="
2357 pop_bubble-alert
2356 pop_dry
2364 pop_hard
2354 pop_message
2359 pop_cluster
2925 pop_soap-bubble
3192 pop_egg-bubble
729 pop_cartoon-bubbles
732 pop_cartoon-bubbles-many
1124 pop_plastic-click
3005 pop_explainer-whoosh
1464 whoosh_quick-accent
166 whoosh_small-sweep
174 whoosh_fast-sweep
168 whoosh_air-sweep
175 whoosh_short-sweep
3115 whoosh_fast-transition
1492 whoosh_cinematic-fast
1481 whoosh_cinematic
1489 whoosh_air
2919 whoosh_trailer-hit
2903 whoosh_impact
788 impact_big-cinematic
2900 impact_logo-intro
1143 impact_deep-whoosh
563 impact_drum-deep
498 impact_heartbeat
790 riser_trailer
632 riser_drama
1144 riser_stutter
784 riser_reverse-impact
3062 magic_wand-sparkle
3082 magic_sparkle-poof
2352 magic_glitter
871 magic_fairy-sparkle
2633 magic_sparkle-intro
2583 magic_light-transition
3060 magic_sparkle-transition
2870 ding_correct-answer
952 ding_correct-reward
951 ding_positive
2867 ding_confirmation
933 ding_bell
2861 ding_announce
235 ding_reveal
946 fail_wrong-answer
2568 ui_cool-click
2997 ui_mouse-clicks
1120 ui_check
2585 ui_switch
2578 ui_app-open
3120 ui_tech-slide
1392 typing_laptop-fast
1395 typing_phone
1432 camera_digital-shutter
1440 camera_classic-click
2946 glitch_quick
2950 glitch_intro-text
1031 glitch_short
2951 glitch_digital-break
1088 fx_tape-rewind
490 fx_heartbeat
"
echo "$LIST" | while read -r id name; do
  [ -z "$id" ] && continue
  dst="$OUT/$name.wav"; [ -f "$dst" ] && continue
  url=$(curl -sL -A "Mozilla/5.0" "https://mixkit.co/free-sound-effects/download/$id/?context=item+grid" \
        | grep -oE "https://assets\.mixkit\.co/active_storage/sfx/$id/$id\.(wav|mp3)" | head -1 || true)
  [ -z "$url" ] && { sleep 1; url=$(curl -sL -A "Mozilla/5.0" "https://mixkit.co/free-sound-effects/download/$id/?context=item+grid" | grep -oE "https://assets\.mixkit\.co/active_storage/sfx/$id/$id\.(wav|mp3)" | head -1 || true); }
  [ -z "$url" ] && { echo "FAIL $id $name (no link)"; continue; }
  src="$TMP/src_$id.${url##*.}"
  curl -sfL -A "Mozilla/5.0" -o "$src" "$url" || { echo "FAIL $id $name"; continue; }
  ffmpeg -v error -y -i "$src" -af "silenceremove=start_periods=1:start_threshold=-50dB,aformat=sample_rates=48000:channel_layouts=stereo" "$TMP/$id.wav"
  peak=$(ffmpeg -i "$TMP/$id.wav" -af volumedetect -f null - 2>&1 | sed -n 's/.*max_volume: \(-\?[0-9.]*\) dB.*/\1/p')
  gain=$(awk -v p="${peak:-0}" 'BEGIN{print -1 - p}')
  ffmpeg -v error -y -i "$TMP/$id.wav" -af "volume=${gain}dB" "$dst"
  echo "ok $name"
done
rm -rf "$TMP"
