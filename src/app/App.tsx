import {ThemeBranding} from '../components/shared/ThemeBranding';
import { GlobalDecor } from '../components/shared/GlobalDecor';
import { PageStyles } from '../components/shared/PageStyles';
import { Preloader } from '../components/preloader/Preloader';
import { PageTransition } from '../components/preloader/PageTransition';
import { Header } from '../components/navigation/Header';
import { Footer } from '../components/footer/Footer';
import { Hero } from '../sections/Hero/Hero';
import { CompanyIntro } from '../sections/CompanyIntro/CompanyIntro';
import { FreightJourney } from '../sections/FreightJourney/FreightJourney';
import { WhyUs } from '../sections/WhyUs/WhyUs';
import { FlightChapter } from '../motion/FlightChapter';
import { CourierDirectory } from '../components/shared/CourierDirectory';
import { ShippingFAQ } from '../components/shared/ShippingFAQ';
import { CallToAction } from '../components/shared/CallToAction';
import { Reviews } from '../components/shared/Reviews';
import { useHomepageRuntime } from '../hooks/useHomepageRuntime';

export default function App() {
  useHomepageRuntime();
  return <>
    <GlobalDecor />
    <Preloader />
    <PageTransition />
    <div className="body-inner">
      <ThemeBranding/><Header />
      <main className="main" id="main-content" data-barba="wrapper">
        <div className="main-inner" data-barba="container" data-barba-namespace="home" data-header="dark-fill" data-show-header="">
          <PageStyles />
          <Hero />
          <CompanyIntro />
          <FreightJourney />
          <WhyUs />
          <FlightChapter />
          <Reviews />
          <CourierDirectory />
          <ShippingFAQ />
          <CallToAction />
          <Footer />
        </div>
      </main>
    </div>
  </>;
}
