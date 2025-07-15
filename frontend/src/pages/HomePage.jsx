import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import { useQuoteServices } from '../store/quoteServices';
import { useServiceServices } from '../store/serviceServices';
import { useStaffServices } from '../store/staffServices';

const HomePage = () => {
  const storeId = Cookies.get('storeId');
  const { getMonthQuoteList, getMonthConfirmedQuoteList, getQuoteAnnualRate } = useQuoteServices();
  const [quoteList, setQuoteList] = useState([])
  const [monthlyConfirmedQuotes, setMonthlyConfirmedQuotes] = useState([])
  const [quoteAnnualRate, setQuoteAnnualRate] = useState('')
  const { getServicesByDate } = useServiceServices();
  const [serviceList, setServiceList] = useState([]);
  const [futureServiceList, setFutureServiceList] = useState([])
  const [excecutedServices, setExcecutedServices] = useState([])
  const [noStaffServices, setNoStaffServices] = useState([])
  const { getStaffList } = useStaffServices();
  const [staffList, setStaffList] = useState([])
  const location = useLocation();
  let loading = false;
  let firstLoad = true;
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.unauthorized) {
      toast.error("User or store not authorized to use this option");
    }
  }, [location]);

  const fetchQuotes = async () => {
    try {
      const auxQuotes = await getMonthQuoteList(storeId)
      setQuoteList(auxQuotes.quoteList)
      const auxConfirmedQuotes = await getMonthConfirmedQuoteList(storeId)
      setMonthlyConfirmedQuotes(auxConfirmedQuotes.quoteList)
      const auxAnnualRate = await getQuoteAnnualRate(storeId)
      setQuoteAnnualRate(auxAnnualRate.closingRate || 0)
    } catch (error) {
      console.log("Error fetching the quotes: ", error)
      toast.error("Error fetching the quotes")
    }
  }

  const fetchServices = async () => {
    try {
      // Definir rango de fechas: desde hace 31 días hasta hoy
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const oneMoreMonth = new Date();
      oneMoreMonth.setDate(oneMoreMonth.getDate() + 31);
      oneMoreMonth.setHours(23, 59, 59, 999);
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 31);
      monthAgo.setHours(0, 0, 0, 0);
      const auxServices = await getServicesByDate(monthAgo, endOfToday, storeId)
      //console.log("auxServices: ", auxServices)
      const auxFutureServices = await getServicesByDate(startOfToday, oneMoreMonth, storeId)
      //console.log("auxFutureServices: ", auxFutureServices)
      const auxFCustomerServices = auxFutureServices.serviceList
        .filter(s => s.type === 'Customer');
      const auxFNoStaffCustomerServices = auxFutureServices.serviceList
        .filter(s =>
          s.type === 'Customer' &&
          (
            !s.staffEmail || s.staffEmail.trim() === '' ||
            !s.dateIn || isNaN(new Date(s.dateIn))
          )
        );
      setNoStaffServices(auxFNoStaffCustomerServices)
      setFutureServiceList(auxFCustomerServices)
      const customerServices = auxServices.serviceList
        .filter(s => s.type === 'Customer');
      //console.log("customerServices: ", customerServices)
      setServiceList(customerServices)
      const filterExcecuted = auxServices.serviceList.filter(s => {
        return s.type === 'Customer' && new Date(s.dateOut) <= endOfToday;
      });
      //console.log("filterExcecuted: ", filterExcecuted)
      setExcecutedServices(filterExcecuted)
    } catch (error) {
      console.log("Error fetching the services: ", error)
      toast.error("Error fetching the services")
    }
  }

  const fetchStaff = async () => {
    try {
      const auxStaff = await getStaffList(storeId)
      //console.log("auxStaff: ", auxStaff)
      setStaffList(auxStaff.staffList)

    } catch (error) {
      console.log("Error fetching the staff: ", error)
      toast.error("Error fetching the staff")
    }
  }

  useEffect(() => {
    //console.log("Store: ", storeId)
    if (firstLoad) {
      fetchQuotes();
      fetchServices();
      fetchStaff();
      firstLoad = false;
    }
  }, [])

  const handleConfirmed = () => {
    navigate(`/past-quote/`);
  }

  const handleOpen = () => {
    navigate(`/confirmed-quote/`);
  }

  const handleSchedule = () => {
    navigate(`/service-schedule/`);
  }

  const handleMissing = () => {
    navigate(`/set-service-dates/`);
  }

  const staffNameServices = excecutedServices
    .map((service) => {
      const staff = staffList.find(s => s.email === service.staffEmail);
      const staffName = staff?.name || "Unkwown"

      return {
        ...service,
        staffName: staffName,
      };
    })

  const staffDist = Object.entries(
    staffNameServices.reduce((acc, service) => {
      const name = service.staffName || 'Unknown';
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, count]) => ({
    name,
    count,
  }));

  const total = staffDist.reduce((sum, item) => sum + item.count, 0);

  return (
    <>
      {loading && <LoadingSpinner />}
      <div className="flex flex-col min-h-screen w-full bg-[#18394C] text-white px-4 py-6 sm:px-8 sm:py-10">
        <motion.div
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-6xl mx-auto bg-sky-50 bg-opacity-90 backdrop-blur-lg rounded-3xl shadow-lg p-6 space-y-8"
        >
          <h2 className="text-4xl font-extrabold text-center text-[#00C49F]">
            Welcome to Serachi
          </h2>
          <p className="text-center text-slate-800 font-semibold text-lg mb-4">Monthly Performance Dashboard</p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* QUOTES */}
            {quoteList.length > 0 && (
              <fieldset className="rounded-2xl border border-slate-500 p-4 shadow-inner">
                <legend className="text-xl font-semibold text-[#00C49F] px-2">Quotes</legend>
                <table className="w-full text-center mt-4">
                  <thead>
                    <tr className="text-cyan-500 text-lg border-b border-cyan-800">
                      <th className="py-2">Open</th>
                      <th>Confirmed</th>
                      <th>Closing Rate (CR)</th>
                      <th>Year CR</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="text-slate-800 text-xl font-semibold transition-all">
                      <td className="py-2 cursor-pointer hover:text-[#00C49F]" onClick={handleOpen}>
                        <p className="border-b-2 border-cyan-500 inline">{quoteList.length}</p>
                      </td>
                      <td className="cursor-pointer hover:text-[#00C49F]" onClick={handleConfirmed}>
                        <p className="border-b-2 border-cyan-500 inline">{monthlyConfirmedQuotes.length}</p>
                      </td>
                      <td>{(((monthlyConfirmedQuotes.length || 0) / (quoteList.length || 1)) * 100).toFixed(2)}%</td>
                      <td>{((quoteAnnualRate || 0) * 100).toFixed(2)}%</td>
                    </tr>
                  </tbody>
                </table>
              </fieldset>
            )}

            {/* SERVICES */}
            {serviceList.length > 0 && (
              <fieldset className="rounded-2xl border border-slate-500 p-4 shadow-inner">
                <legend className="text-xl font-semibold text-[#00C49F] px-2">Services</legend>
                <table className="w-full text-center mt-4">
                  <thead>
                    <tr className="text-cyan-500 text-lg border-b border-cyan-800">
                      <th>Executed</th>
                      <th>To Execute</th>
                      <th>Missing Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="text-slate-800 text-xl font-semibold">
                      <td>{serviceList.length}</td>
                      <td className="cursor-pointer hover:text-[#00C49F]" onClick={handleSchedule}>
                        <p className="border-b-2 border-cyan-500 inline">{futureServiceList.length}</p>
                      </td>
                      <td className="cursor-pointer hover:text-[#00C49F]" onClick={handleMissing}>
                        <p className="border-b-2 border-cyan-500 inline">{noStaffServices.length}</p>
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* STAFF DIST */}
                {staffDist.length > 0 && (
                  <div className="mt-6">
                    <fieldset className="rounded-xl border border-slate-500 px-4 py-2">
                      <legend className="text-lg font-semibold text-[#00C49F] px-1">Executed by</legend>
                      <div className="max-h-60 overflow-y-auto mt-3">
                        <table className="w-full text-center mt-3">
                          <thead>
                            <tr className="text-cyan-500 text-sm border-b border-cyan-700">
                              <th>Name</th>
                              <th># Services</th>
                              <th>%</th>
                            </tr>
                          </thead>
                          <tbody>
                            {staffDist.map((s, i) => (
                              <tr
                                key={i}
                                className="text-slate-800 text-sm"
                              >
                                <td className="py-1">{s.name}</td>
                                <td>{s.count}</td>
                                <td>{((s.count / total) * 100).toFixed(1)}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </fieldset>
                  </div>
                )}
              </fieldset>
            )}
          </div>
        </motion.div>
      </div>
    </>
  )
}

export default HomePage