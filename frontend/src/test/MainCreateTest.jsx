// src/pages/NewIncome.jsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIncomeServices } from "../store/incomeServices";
import { useProductServices } from '../store/productServices';
import { useQuoteServices } from '../store/quoteServices';
import LoadingSpinner from "../components/LoadingSpinner";
import { useRoomReservationServices } from "../store/roomReservationServices";
import { useExpenseServices } from "../store/expenseServices";
import { useExperienceServices } from "../store/experienceServices";
import { usePRrecordServices } from "../store/prrecordServices";
import { useServiceServices } from "../store/serviceServices";
import { useCustomerServices } from "../store/customerServices";

export default function MainTest() {
    const { createIncome, deleteAllIncomeByUEmail } = useIncomeServices();
    const { createRoomReservation, deleteAllRoomReservationByUEmail } = useRoomReservationServices();
    const { createExpense, deleteAllExpenseByUEmail } = useExpenseServices();
    const { createExperience, deleteAllExperienceByUEmail } = useExperienceServices();
    const { createPRrecord, deleteAllPRrecordByUEmail } = usePRrecordServices();
    const { createQuote, deleteAllQuoteByUEmail } = useQuoteServices();
    const { createService, deleteAllServiceByUEmail } = useServiceServices();
    const { createCustomer, deleteAllCustomerByUEmail } = useCustomerServices();
    const { createProduct, deleteAllProductByUEmail } = useProductServices();
    const [loading, setLoading] = useState(false)
    const [createOK, setCreateOK] = useState(false)
    const [deleteOK, setDeleteOK] = useState(false)
    const [allOK, setAllOK] = useState(false)
    const [error, setError] = useState('')
    let firstCreate = true;
    let firstDelete = true;
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const cEmail = 'testintegrado@gmail.com';
    const sEmail = 'staffTest@gmail.com'
    const qId = 'Q1234567890';
    const sId = 'S12345'
    const storeId = 'DEMO'
    const incomeProductList = {
        productId: 'P12345',
        productName: 'Pruebas',
        Qty: '1',
        productUnitaryPrice: '100',
        productFinalPrice: '100'
    }
    const xTag = [{ name: 'Prueba Tag', code: '123 Tag' }]
    const uEmail = 'admin@serachi.net'
    const description = 'Test Desc'

    const incomePayload = {
        date: today,
        customerEmail: cEmail,
        quoteId: qId,
        productList: incomeProductList,
        amount: 100,
        tag: xTag,
        userEmail: uEmail,
        paymentMethod: 'CASH',
        storeId: storeId
    }

    const roomResPayload = {
        dateIn: today,
        roomId: 'R123',
        dateOut: tomorrow,
        customerEmail: cEmail,
        roomFinalPrice: 100,
        roomUnitaryPrice: 100,
        bedsReserved: 1,
        currency: 'USD',
        userEmail: uEmail,
        storeId: storeId,
        isPaid: false,
    }

    const expensePayload = {
        date: today,
        supplierId: sId,
        description: description,
        type: "TEST",
        currency: "USD",
        amount: 100,
        tag: xTag,
        userEmail: uEmail,
        paymentMethod: "CASH",
        storeId: storeId
    }

    const experiencePayload = {
        name: 'EXP TEST',
        storeId: storeId,
        userEmail: uEmail,
        customerEmail: cEmail,
        dateIn: today,
        dateOut: tomorrow,
        quoteId: qId,
    }
    const recordPayload = [
        {
            staffEmail: sEmail,
            serviceId: ['S1234'],
            amount: 100,
        }
    ]
    const PRPayload = {
        dateInit: today,
        dateEnd: tomorrow,
        recordDetail: recordPayload,
        tag: xTag,
        type: "Payroll",
        userEmail: uEmail,
        storeId: storeId,
    }

    const roomList = [
        {
            roomId: 'R123',
            roomName: 'ROOM TEST',
            roomDateIn: today,
            roomDateOut: tomorrow,
            Qty: 1,
            roomNights: 1,
            roomUnitaryPrice: 100,
            roomFinalPrice: 100,
            isPrivate: false
        }
    ]

    const productList = [
        {
            productId: 'P123',
            productName: 'TEST',
            Qty: 1,
            productUnitaryPrice: 100,
            productFinalPrice: 100
        }
    ]

    const quotePayload = {
        dateIn: today,
        dateOut: tomorrow,
        customerEmail: cEmail,
        customerName: 'TEST',
        roomList: roomList,
        partnerId: 'P12345',
        productList: productList,
        discount: 0,
        taxes: 7,
        grossPrice: 100,
        finalPrice: 107,
        currency: 'USD',
        isConfirmed: true,
        isReturningCustomer: false,
        userEmail: uEmail,
        userName: 'TEST INTEGR',
        tag: xTag,
        source: 'ORGANIC',
        storeId: storeId,
        sendEmail:false,
    }

    const servicePayload = {
        name: 'S - TEST',
        productId: 'P12345',
        customerEmail: cEmail,
        storeId: storeId,
        userEmail: uEmail,
        dateIn: today,
        dateOut: tomorrow,
        type: 'TEST',
        isPaid: false,
        staffEmail: sEmail
    }

    const customerPayload = {
        name: 'TEST',
        lastName: 'INTEGRATED',
        email: cEmail,
        storeId: storeId,
        userEmail: uEmail
    }

    const productPayload = {
        name: 'TEST PRODUCT',
        price: 100,
        tax: 7,
        finalPrice: 107,
        currency: 'USD',
        type: 'TEST',
        userId: '1233456',
        userEmail: uEmail,
        durationDays: 0,
        isTangible: true,
        isPartMenu: true,
        storeId: storeId
    }

    const createTest = async () => {
        try {
            setLoading(true);
            console.log("Payloads: ", {incomePayload,roomResPayload,expensePayload,experiencePayload,PRPayload,quotePayload,servicePayload,customerPayload,productPayload})
            const [xIncome, xRoom, xExpense, xExp, xPR, xQuote, xServ, xCust, xProd] = await Promise.all([
                createIncome(incomePayload),
                createRoomReservation(roomResPayload),
                createExpense(expensePayload),
                createExperience(experiencePayload),
                createPRrecord(PRPayload),
                createQuote(quotePayload),
                createService(servicePayload),
                createCustomer(customerPayload),
                createProduct(productPayload),
            ])
            console.log("All create OK")
            setCreateOK(true);
            setLoading(false);
        } catch (error) {
            console.log("Error creating: ", error)
            setCreateOK(false);
            setError(error);
            setLoading(false);
        }

    }

    const deleteTest = async () => {
        try {
            setLoading(true)
            const [xIncome, xRoom, xExpense, xExp, xPR, xQuote, xServ, xCust, xProd] = await Promise.all([
                deleteAllIncomeByUEmail(uEmail, storeId),
                deleteAllRoomReservationByUEmail(uEmail, storeId),
                deleteAllExpenseByUEmail(uEmail, storeId),
                deleteAllExperienceByUEmail(uEmail, storeId),
                deleteAllPRrecordByUEmail(uEmail, storeId),
                deleteAllQuoteByUEmail(uEmail, storeId),
                deleteAllServiceByUEmail(uEmail, storeId),
                deleteAllCustomerByUEmail(uEmail, storeId),
                deleteAllProductByUEmail(uEmail, storeId),
            ])
            console.log("All Delete OK")
            setDeleteOK(true)
            setLoading(false)
        } catch (error) {
            console.log("Error deleting: ", error)
            setDeleteOK(false);
            setLoading(false)
            setError((prev) => ({
                ...prev,
                deleteError: error,
            }));
        }
    }

    useEffect(() => {

        if (firstCreate) {
            createTest();
            firstCreate = false;
            setCreateOK(true);
        }

    }, [])

    useEffect(() => {

        if (deleteOK && createOK) {
            setAllOK(true)
        }

    }, [deleteOK, createOK])

    useEffect(() => {

        if (!firstCreate && firstDelete) {
            deleteTest();
            firstDelete = false;
            setDeleteOK(true)
        }

    }, [firstCreate])


    return (
        <>
            {
                loading && (
                    <LoadingSpinner />
                )
            }
            <div className="flex flex-col min-h-screen w-full bg-[#18394C] text-slate-800 px-4 py-6 sm:px-8 sm:py-10">
                <motion.div
                    initial={{ opacity: 0, scale: 2 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col w-full max-w-9/12 mx-auto bg-[#18394C] bg-opacity-80 backdrop-filter backdrop-blur-lg overflow-hidden min-h-screen items-center"
                >
                    <h1 className="text-3xl font-bold mb-6 text-center text-[#00C49F]">Creation Test</h1>
                    { createOK? (
                        <div className="text-lg font-bold mt-2 mb-2 text-cyan-400">
                            <p>All creation OK</p>
                        </div>
                    ):(
                        <div>
                            <p>{error != '' ? "Creation failed" : "....waiting...."}</p>
                            <p>{error}</p>
                        </div>
                    )}
                    { deleteOK? (
                        <div className="text-lg font-bold mt-2 mb-2 text-cyan-400">
                            <p>All deletion OK</p>
                        </div>
                    ):(
                        <div>
                            <p>{error != '' ? "Deletion failed" : "....waiting...."}</p>
                            <p>{error}</p>
                        </div>
                    )}
                    { allOK? (
                        <div className="text-lg font-bold mt-2 mb-2 text-cyan-400">
                            <p>CONGRATS! ALL TEST PASSED!</p>
                        </div>
                    ):(
                        <div>
                            <p>{error != '' ? "Something failed" : "....waiting...."}</p>
                            <p>{error}</p>
                        </div>
                    )}
                </motion.div>
            </div>
        </>
    );
}
