import { Composition } from "remotion";
import { TestGraphic } from "./reels/TestGraphic";
import { PopulerUrun, POPULER_URUN_SEC } from "./reels/populer-urun/PopulerUrun";
import { Telefon, TELEFON_FRAMES } from "./reels/telefon/Telefon";
import { Haber, HaberDikey, HABER_FRAMES } from "./reels/haber/Haber";
import { Bulten, BultenDikey, bultenFrames, shortFrames, BultenProps } from "./reels/haber/Bulten";
import dtv1Script from "./reels/deploytv-1/script.json";
import dtv1Voice from "./reels/deploytv-1/voice.json";
import dtv1Env from "./reels/deploytv-1/envelope.json";
import dtv1Credits from "../public/deploytv-1/img/CREDITS.json";
import dtv2Script from "./reels/deploytv-2/script.json";
import dtv2Voice from "./reels/deploytv-2/voice.json";
import dtv2Env from "./reels/deploytv-2/envelope.json";
import dtv2Credits from "../public/deploytv-2/img/CREDITS.json";
import s2_github from "./reels/deploytv-2/shorts/short-github.json";
import s2_github_env from "./reels/deploytv-2/shorts/short-github.envelope.json";
import s2_gta from "./reels/deploytv-2/shorts/short-gta.json";
import s2_gta_env from "./reels/deploytv-2/shorts/short-gta.envelope.json";
import s2_nvidia from "./reels/deploytv-2/shorts/short-nvidia.json";
import s2_nvidia_env from "./reels/deploytv-2/shorts/short-nvidia.envelope.json";
import s2_robot from "./reels/deploytv-2/shorts/short-robot.json";
import s2_robot_env from "./reels/deploytv-2/shorts/short-robot.envelope.json";
import { ProfilFoto, Banner, Kapak } from "./reels/haber/Marka";
import { Sistem, sistemFrames } from "./reels/sistem/Sistem";
import { SfxSampler, sfxSamplerDuration } from "./reels/sfx";
import { HizliTest, HIZLI_TEST_FRAMES } from "./reels/hizli-test/HizliTest";
import { Test2, TEST2_FRAMES } from "./reels/test-2/Test2";
import { Secenek1, SECENEK1_FRAMES } from "./reels/secenek-1/Secenek1";
import { Secenek2, SECENEK2_FRAMES } from "./reels/secenek-2/Secenek2";
import { Secenek3, SECENEK3_FRAMES } from "./reels/secenek-3/Secenek3";
import { Secenek4, SECENEK4_FRAMES } from "./reels/secenek-4/Secenek4";
import { Fullhd30, FULLHD30_FRAMES } from "./reels/fullhd-30/Fullhd30";
import { KarsilastirmaShorts, SS_TEST_FRAMES } from "./reels/karsilastirma/KarsilastirmaShorts";
import { SsTrend, SS_TREND_FRAMES } from "./reels/ss-trend/SsTrend";
import { AiGercek60, AI_GERCEK_60_FRAMES } from "./reels/ai-gercek-60/AiGercek60";
import { KarakterVitrini } from "./reels/cizgi/KarakterVitrini";
import { DijitalizTest, DIJITALIZ_TEST_FRAMES } from "./reels/dijitaliz-test/DijitalizTest";
import { DijitalizZengin, DIJITALIZ_ZENGIN_FRAMES } from "./reels/dijitaliz-zengin/DijitalizZengin";
import { DijitalizViralTest, DIJITALIZ_VIRAL_TEST_FRAMES } from "./reels/dijitaliz-viral-test/DijitalizViralTest";
import { DijitalizMarket, DIJITALIZ_MARKET_FRAMES } from "./reels/dijitaliz-market/DijitalizMarket";
import { DijitalizMarket3D, DIJITALIZ_MARKET_3D_FRAMES } from "./reels/dijitaliz-market-3d/DijitalizMarket3D";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TestGraphic"
        component={TestGraphic}
        durationInFrames={240}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="PopulerUrun"
        component={PopulerUrun}
        durationInFrames={POPULER_URUN_SEC * 30}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="Telefon"
        component={Telefon}
        durationInFrames={TELEFON_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="Haber"
        component={Haber}
        durationInFrames={HABER_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="HaberDikey"
        component={HaberDikey}
        durationInFrames={HABER_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="DeployTv-1"
        component={Bulten}
        defaultProps={{ slug: "deploytv-1", date: dtv1Script.date, scenes: dtv1Script.scenes, voice: dtv1Voice, envelope: dtv1Env, credits: dtv1Credits, face: { closed: "hazal/yuz_kapali.png", open: "hazal/yuz_acik.png" } } as BultenProps}
        durationInFrames={bultenFrames(dtv1Voice)}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="DeployTv-2"
        component={Bulten}
        defaultProps={{ slug: "deploytv-2", date: dtv2Script.date, scenes: dtv2Script.scenes, voice: dtv2Voice, envelope: dtv2Env, credits: dtv2Credits, face: { closed: "hazal/yuz_kapali.png", open: "hazal/yuz_acik.png" } } as BultenProps}
        durationInFrames={bultenFrames(dtv2Voice)}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="SfxSampler"
        component={SfxSampler}
        durationInFrames={sfxSamplerDuration(30)}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="DeployTv-2-Short-github"
        component={BultenDikey}
        durationInFrames={shortFrames(s2_github.voice)}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ slug: "deploytv-2", date: s2_github.date, scenes: s2_github.scenes, voice: s2_github.voice, envelope: s2_github_env, credits: dtv2Credits, voiceSrc: "deploytv-2/shorts/short-github.mp3", face: { closed: "hazal/yuz_kapali.png", open: "hazal/yuz_acik.png" } } as BultenProps}
      />
      <Composition
        id="DeployTv-2-Short-gta"
        component={BultenDikey}
        durationInFrames={shortFrames(s2_gta.voice)}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ slug: "deploytv-2", date: s2_gta.date, scenes: s2_gta.scenes, voice: s2_gta.voice, envelope: s2_gta_env, credits: dtv2Credits, voiceSrc: "deploytv-2/shorts/short-gta.mp3", face: { closed: "hazal/yuz_kapali.png", open: "hazal/yuz_acik.png" } } as BultenProps}
      />
      <Composition
        id="DeployTv-2-Short-nvidia"
        component={BultenDikey}
        durationInFrames={shortFrames(s2_nvidia.voice)}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ slug: "deploytv-2", date: s2_nvidia.date, scenes: s2_nvidia.scenes, voice: s2_nvidia.voice, envelope: s2_nvidia_env, credits: dtv2Credits, voiceSrc: "deploytv-2/shorts/short-nvidia.mp3", face: { closed: "hazal/yuz_kapali.png", open: "hazal/yuz_acik.png" } } as BultenProps}
      />
      <Composition
        id="DeployTv-2-Short-robot"
        component={BultenDikey}
        durationInFrames={shortFrames(s2_robot.voice)}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ slug: "deploytv-2", date: s2_robot.date, scenes: s2_robot.scenes, voice: s2_robot.voice, envelope: s2_robot_env, credits: dtv2Credits, voiceSrc: "deploytv-2/shorts/short-robot.mp3", face: { closed: "hazal/yuz_kapali.png", open: "hazal/yuz_acik.png" } } as BultenProps}
      />
      <Composition id="DeployTv-Profil" component={ProfilFoto} durationInFrames={1} fps={30} width={800} height={800} />
      <Composition id="DeployTv-Banner" component={Banner} durationInFrames={1} fps={30} width={2560} height={1440} />
      <Composition id="DeployTv-2-Kapak" component={Kapak} durationInFrames={1} fps={30} width={1280} height={720} defaultProps={{ img: "deploytv-2/img/jensen.jpg", face: "hazal/yuz_acik.png", badge: "HAFTALIK #2", line1: "NVIDIA'DA", line2: "DEPREM!" }} />
      <Composition id="Sistem" component={Sistem} durationInFrames={sistemFrames("full")} fps={30} width={1080} height={1920} defaultProps={{ variant: "full" as const }} />
      <Composition id="Sistem-60" component={Sistem} durationInFrames={sistemFrames("60")} fps={30} width={1080} height={1920} defaultProps={{ variant: "60" as const }} />
      <Composition id="HizliTest" component={HizliTest} durationInFrames={HIZLI_TEST_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="Test2" component={Test2} durationInFrames={TEST2_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="Secenek1" component={Secenek1} durationInFrames={SECENEK1_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="Secenek2" component={Secenek2} durationInFrames={SECENEK2_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="Secenek3" component={Secenek3} durationInFrames={SECENEK3_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="Secenek4" component={Secenek4} durationInFrames={SECENEK4_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="Fullhd30" component={Fullhd30} durationInFrames={FULLHD30_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="KarsilastirmaShorts" component={KarsilastirmaShorts} durationInFrames={SS_TEST_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="SsTrend" component={SsTrend} durationInFrames={SS_TREND_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="AiGercek60" component={AiGercek60} durationInFrames={AI_GERCEK_60_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="KarakterVitrini" component={KarakterVitrini} durationInFrames={1} fps={30} width={1600} height={2000} />
      <Composition id="DijitalizTest" component={DijitalizTest} durationInFrames={DIJITALIZ_TEST_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="DijitalizZengin" component={DijitalizZengin} durationInFrames={DIJITALIZ_ZENGIN_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="DijitalizViralTest" component={DijitalizViralTest} durationInFrames={DIJITALIZ_VIRAL_TEST_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="DijitalizMarket" component={DijitalizMarket} durationInFrames={DIJITALIZ_MARKET_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="DijitalizMarket3D" component={DijitalizMarket3D} durationInFrames={DIJITALIZ_MARKET_3D_FRAMES} fps={30} width={1080} height={1920} />
    </>
  );
};
