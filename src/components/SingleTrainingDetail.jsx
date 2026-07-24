import { useEffect, useState } from "react";
import {
  CalendarDaysIcon,
  ClockIcon,
  PencilSquareIcon,
  ChevronDownIcon,
  ShoppingCartIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import Layout from "./layout";
import { useParams } from "react-router-dom";
import { useCoursesContext } from "../context/courses_context";
import { Link } from "react-router-dom";
import { useCartContext } from "../context/cart_context";
import { Oval } from "react-loader-spinner";
import parse from "html-react-parser";

const ContentSection = ({ title, children }) => (
  <section className="group relative pl-4 sm:pl-5 border-l-2 border-slate-100 hover:border-[#184e77]/40 transition-colors duration-300 pb-7 last:pb-0">
    <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-[#184e77]/20 group-hover:bg-[#184e77] transition-colors duration-300" />
    <h2 className="text-base sm:text-lg font-semibold text-[#184e77] mb-3 tracking-tight">
      {title}
    </h2>
    <div className="prose prose-sm sm:prose-base prose-slate max-w-none text-slate-600 leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2.5 [&_li]:my-1">
      {children}
    </div>
  </section>
);

const PriceDisplay = ({ totalPrice, selectedCount }) => (
  <div className="relative overflow-hidden text-center py-5 px-4 rounded-xl bg-gradient-to-br from-[#184e77]/5 via-blue-50/80 to-white border border-[#184e77]/10">
    <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-[#184e77]/5 blur-2xl pointer-events-none" />
    <p className="text-xs text-orange-500/90 line-through font-medium tracking-wide uppercase">
      Was $
      {totalPrice != null && totalPrice > 0
        ? (totalPrice + selectedCount * 49).toFixed(2)
        : "00.00"}
    </p>
    <p className="text-3xl sm:text-4xl font-bold text-[#184e77] mt-1 tabular-nums tracking-tight">
      $
      {totalPrice != null && totalPrice > 0
        ? totalPrice.toFixed(2)
        : "00.00"}
    </p>
    {selectedCount > 0 && (
      <p className="inline-flex items-center gap-1 mt-2.5 px-2.5 py-1 rounded-full text-xs text-emerald-700 font-medium bg-emerald-50 border border-emerald-100">
        <TagIcon className="w-3.5 h-3.5" />
        Save ${selectedCount * 49}
      </p>
    )}
  </div>
);

const PricingOption = ({ pricing, isChecked, onToggle }) => (
  <label
    className={`flex items-center justify-between gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
      isChecked
        ? "border-[#184e77]/50 bg-[#184e77]/[0.04] shadow-[0_1px_3px_rgba(24,78,119,0.08)]"
        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80"
    }`}
  >
    <div className="flex items-center gap-2.5 min-w-0">
      <input
        type="checkbox"
        checked={isChecked}
        onChange={onToggle}
        className="w-4 h-4 rounded border-slate-300 text-[#184e77] focus:ring-[#184e77]/30 focus:ring-offset-0 shrink-0"
      />
      <span className="text-[13px] sm:text-sm text-slate-700 font-medium leading-snug">
        {pricing.sessionType}
      </span>
    </div>
    <span className="text-sm font-bold text-[#184e77] shrink-0 tabular-nums">
      ${pricing.price}
    </span>
  </label>
);

const PricingGroup = ({ title, children }) => (
  <div className="space-y-2">
    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-1">
      {title}
    </h3>
    <div className="space-y-1.5">{children}</div>
  </div>
);

const AddToCartButton = ({
  disabled,
  onClick,
  courseID,
  imageSrc,
  title,
  instructor,
  totalPrice,
  discountedPrice,
  selectedPricings,
  addToCart,
}) => (
  <Link
    to={disabled ? "#" : "/cart"}
    className={`group relative w-full flex items-center justify-center gap-2 h-11 text-sm font-semibold rounded-lg text-white transition-all duration-200 ${
      disabled
        ? "bg-purple-300 cursor-not-allowed pointer-events-none"
        : "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-sm hover:shadow-md hover:shadow-purple-200/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 active:scale-[0.98]"
    }`}
    onClick={(e) => {
      if (disabled) {
        e.preventDefault();
        return;
      }
      addToCart(
        courseID,
        imageSrc,
        title,
        instructor,
        selectedPricings.length > 0 ? totalPrice : discountedPrice,
        selectedPricings,
      );
    }}
  >
    <ShoppingCartIcon className="w-5 h-5" />
    Add to Cart
  </Link>
);

const SingleTrainingDetail = () => {
  const { id } = useParams();
  const { fetchSingleCourse, single_course } = useCoursesContext();
  const { addToCart } = useCartContext();
  const [loading, setLoading] = useState(true);
  const [selectedPricings, setSelectedPricings] = useState([]);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      await fetchSingleCourse(id);
      setLoading(false);
    };
    fetchData();
  }, [id, fetchSingleCourse]);

  useEffect(() => {
    if (single_course?.Pricings?.length) {
      const isPastWebinar = new Date(single_course.webinarDate) < new Date();

      if (isPastWebinar) {
        const accessOptions = single_course.Pricings.filter(
          (pricing) =>
            pricing.sessionType === "Recorded session" ||
            pricing.sessionType === "Transcript" ||
            pricing.sessionType === "Recorded Plus Transcript session",
        );

        if (accessOptions.length > 0) {
          setSelectedPricings([accessOptions[0]]);
        }
      } else {
        setSelectedPricings([single_course.Pricings[0]]);
      }
    }
  }, [single_course]);

  const handlePricingToggle = (pricing) => {
    setSelectedPricings((prev) => {
      const exists = prev.find((p) => p.id === pricing.id);

      if (exists) {
        return prev.filter((p) => p.id !== pricing.id);
      } else {
        return [...prev, pricing];
      }
    });
  };

  const totalPrice = selectedPricings.reduce(
    (sum, item) => sum + parseFloat(item.price),
    0,
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <Oval
          height={50}
          width={50}
          color="#184e77"
          wrapperStyle={{}}
          wrapperClass=""
          visible={true}
          ariaLabel="oval-loading"
          secondaryColor="#1a659e"
          strokeWidth={2}
          strokeWidthSecondary={2}
        />
      </div>
    );
  }

  const {
    courseID,
    title,
    instructor,
    discountedPrice,
    description,
    what_you_will_learn,
    imageSrc,
    Pricings = [],
    webinarDate,
    duration,
    areas_covered,
    who_will_benefit,
    instructor_profile,
    why_register,
    background,
  } = single_course;

  const dateTime = new Date(webinarDate);
  const webinarDateUTC = new Date(webinarDate);
  const isPastWebinar = new Date(webinarDate) < new Date();
  const accessOptions = Pricings.filter(
    (pricing) =>
      pricing.sessionType === "Recorded session" ||
      pricing.sessionType === "Transcript" ||
      pricing.sessionType === "Recorded Plus Transcript session",
  );

  const day = webinarDateUTC.getUTCDate();
  const monthYear = webinarDateUTC.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  const weekday = webinarDateUTC.toLocaleString("en-US", {
    weekday: "long",
    timeZone: "UTC",
  });
  const formattedTimeEST = dateTime.toLocaleString("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const formattedTimePST = dateTime.toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  function convertMinutes(minutes) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (minutes <= 60) {
      return `${minutes} min`;
    }

    return `${hours} hour${hours > 1 ? "s" : ""} ${remainingMinutes} min`;
  }

  const visiblePricings = showMore
    ? Pricings.slice(0, 5)
    : Pricings.slice(0, 2);

  const contentSections = [
    { key: "description", title: "Description", content: description },
    { key: "why_register", title: "Why Register", content: why_register },
    {
      key: "what_you_will_learn",
      title: "Why Should You Attend",
      content: what_you_will_learn,
    },
    {
      key: "areas_covered",
      title: "Areas Covered in the Webinar Session",
      content: areas_covered,
    },
    { key: "who_will_benefit", title: "Who Will Benefit?", content: who_will_benefit },
    {
      key: "instructor_profile",
      title: "Instructor Profile",
      content: instructor_profile,
    },
    { key: "background", title: "Background", content: background },
  ].filter((section) => section.content);

  const renderPricingSidebar = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden lg:sticky lg:top-6 ring-1 ring-slate-100">
      <div className="relative bg-gradient-to-br from-[#184e77] to-[#1a659e] px-5 py-4 overflow-hidden">
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5 blur-xl pointer-events-none" />
        <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/5 blur-lg pointer-events-none" />
        <h3 className="relative text-white font-semibold text-base">
          {isPastWebinar ? "On-Demand Access" : "Register Now"}
        </h3>
        <p className="relative text-blue-100/80 text-xs mt-0.5">
          {isPastWebinar
            ? "Choose your access option"
            : "Select your session type"}
        </p>
      </div>

      <div className="p-4 sm:p-5 space-y-4 divide-y divide-slate-100">
        <div className="space-y-4 pb-1">
        <PriceDisplay
          totalPrice={totalPrice}
          selectedCount={selectedPricings.length}
        />

        <AddToCartButton
          disabled={selectedPricings.length === 0}
          courseID={courseID}
          imageSrc={imageSrc}
          title={title}
          instructor={instructor}
          totalPrice={totalPrice}
          discountedPrice={discountedPrice}
          selectedPricings={selectedPricings}
          addToCart={addToCart}
        />
        </div>

        <div className="space-y-4 pt-4">
        {isPastWebinar ? (
          <PricingGroup title="Access Options">
            {accessOptions.map((pricing) => {
              const isChecked = selectedPricings.some(
                (p) => p.id === pricing.id,
              );
              return (
                <PricingOption
                  key={pricing.id}
                  pricing={pricing}
                  isChecked={isChecked}
                  onToggle={() => handlePricingToggle(pricing)}
                />
              );
            })}
          </PricingGroup>
        ) : (
          <>
            <PricingGroup title="Live Webinar">
              {visiblePricings.map((pricing) => {
                const isChecked = selectedPricings.some(
                  (p) => p.id === pricing.id,
                );
                return (
                  <PricingOption
                    key={pricing.id}
                    pricing={pricing}
                    isChecked={isChecked}
                    onToggle={() => handlePricingToggle(pricing)}
                  />
                );
              })}

              {Pricings.length > 2 && (
                <button
                  onClick={() => setShowMore(!showMore)}
                  className="w-full mt-1 py-2 text-[#184e77] font-medium flex items-center justify-center gap-1.5 hover:text-blue-700 transition-colors"
                >
                  <span className="underline underline-offset-2">
                    {showMore ? "Less Attendees" : "More Attendees"}
                  </span>
                  <ChevronDownIcon
                    className={`w-4 h-4 transition-transform duration-200 ${
                      showMore ? "rotate-180" : ""
                    }`}
                  />
                </button>
              )}
            </PricingGroup>

            <PricingGroup title="On-Demand">
              {Pricings?.filter(
                (pricing) =>
                  pricing.sessionType === "Recorded session" ||
                  pricing.sessionType === "Transcript",
              ).map((pricing) => {
                const isChecked = selectedPricings.some(
                  (p) => p.id === pricing.id,
                );
                return (
                  <PricingOption
                    key={pricing.id}
                    pricing={pricing}
                    isChecked={isChecked}
                    onToggle={() => handlePricingToggle(pricing)}
                  />
                );
              })}
            </PricingGroup>

            <PricingGroup title="Value Packs">
              {Pricings?.filter(
                (pricing) =>
                  pricing.sessionType === "Live Plus Recorded session" ||
                  pricing.sessionType === "Live Plus Transcript session" ||
                  pricing.sessionType ===
                    "Recorded Plus Transcript session" ||
                  pricing.sessionType ===
                    "Group Session For 10 Attendees" ||
                  pricing.sessionType ===
                    "Group Session For More Than 10 Attendees",
              ).map((pricing) => {
                const isChecked = selectedPricings.some(
                  (p) => p.id === pricing.id,
                );
                return (
                  <PricingOption
                    key={pricing.id}
                    pricing={pricing}
                    isChecked={isChecked}
                    onToggle={() => handlePricingToggle(pricing)}
                  />
                );
              })}
            </PricingGroup>
          </>
        )}
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50">
        {/* Hero Header */}
        <div className="relative bg-gradient-to-br from-[#184e77] via-[#1a659e] to-[#133d5e] text-white overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.03%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-60 pointer-events-none" />
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-9">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold tracking-wider uppercase mb-3 ${
                isPastWebinar
                  ? "bg-orange-400/15 text-orange-100 border border-orange-300/25"
                  : "bg-emerald-400/15 text-emerald-100 border border-emerald-300/25"
              }`}
            >
              {isPastWebinar ? "On-Demand" : "Live Webinar"}
            </span>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-snug max-w-3xl tracking-tight">
              {title}
            </h1>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-7">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-5">
              {/* Course Info Card */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-5 items-start">
                    {/* Image */}
                    <div className="md:col-span-2">
                      <div className="relative aspect-[4/3] md:aspect-square overflow-hidden rounded-lg ring-1 ring-slate-200/80 shadow-sm group">
                        <img
                          src={imageSrc}
                          alt={title}
                          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
                        />
                        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#184e77]/20 to-transparent pointer-events-none" />
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="md:col-span-3 space-y-4">
                      {/* Date Block */}
                      <div className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-slate-50 to-blue-50/50 border border-slate-100">
                        <div className="flex flex-col items-center justify-center w-16 h-16 rounded-lg bg-[#184e77] text-white shrink-0 shadow-sm">
                          <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80 leading-none">
                            {webinarDateUTC.toLocaleString("en-US", { month: "short", timeZone: "UTC" })}
                          </span>
                          <span className="text-2xl font-bold leading-none mt-0.5">
                            {day}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-base font-semibold text-slate-900">
                            {weekday}
                          </p>
                          <p className="text-sm text-slate-600">{monthYear}</p>
                          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
                            <CalendarDaysIcon className="w-3.5 h-3.5 text-[#184e77]" />
                            {formattedTimeEST} EST · {formattedTimePST} PST
                          </p>
                        </div>
                      </div>

                      {/* Instructor & Duration */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex items-center gap-3 p-3.5 rounded-lg bg-white border border-slate-100 hover:border-slate-200 transition-colors">
                          <div className="flex items-center justify-center w-9 h-9 rounded-md bg-[#184e77]/10 text-[#184e77] shrink-0">
                            <PencilSquareIcon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                              Instructor
                            </p>
                            <p className="text-sm font-semibold text-slate-800 truncate">
                              {instructor?.replace(/"/g, "")}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3.5 rounded-lg bg-white border border-slate-100 hover:border-slate-200 transition-colors">
                          <div className="flex items-center justify-center w-9 h-9 rounded-md bg-[#184e77]/10 text-[#184e77] shrink-0">
                            <ClockIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                              Duration
                            </p>
                            <p className="text-sm font-semibold text-slate-800">
                              {duration ? convertMinutes(duration) : "—"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Sections */}
              {contentSections.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-4 sm:p-6 lg:p-7">
                  <div className="space-y-7">
                    {contentSections.map((section) => (
                      <ContentSection key={section.key} title={section.title}>
                        {parse(section.content)}
                      </ContentSection>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar — visible on all screens, sticky on desktop */}
            <div className="lg:col-span-1">
              {renderPricingSidebar()}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SingleTrainingDetail;
