
export function createCustomServices(customService) {
    const {
        name,
        dateIn,
        dateOut,
        repetitions = 0,
        productId,
        staffEmail,
        onePerDay,
        perWeek,
    } = customService;

    if (!dateIn || !dateOut || !productId) {
        throw new Error('Missing required fields');
    }


    const daysCalc = (datein, dateout) => {
        const initialDate = new Date(datein);
        const endDate = new Date(dateout);
        const msDiff = endDate.getTime() - initialDate.getTime();
        return Math.floor(msDiff / (1000 * 60 * 60 * 24));
    };


    const inDate = new Date(dateIn);
    const outDate = new Date(dateOut);
    const diffDays = daysCalc(inDate, outDate) || 0;

    const newServices = [];
    const auxDateIn = new Date(inDate);
    const auxDateOut = new Date(outDate);
    const auxWeekDateIn = new Date(inDate);

    if (perWeek) {
        if (onePerDay) {
            const auxHours = auxDateIn.getHours() + 4;
            for (let a = 0; a <= repetitions; a++) {
                const baseWeekDate = new Date(auxWeekDateIn);
                baseWeekDate.setDate(baseWeekDate.getDate() + (a * 7));

                for (let i = 0; i <= diffDays; i++) {
                    const currentDateIn = new Date(baseWeekDate);
                    currentDateIn.setDate(currentDateIn.getDate() + i);

                    const currentDateOut = new Date(currentDateIn);
                    currentDateOut.setHours(auxHours);

                    newServices.push({
                        name,
                        dateIn: currentDateIn.toISOString(),
                        dateOut: currentDateOut.toISOString(),
                        productId,
                        staffEmail,
                    });
                }
            }
        } else {
            for (let i = 0; i <= repetitions; i++) {
                const currentDateIn = new Date(auxDateIn);
                const currentDateOut = new Date(auxDateOut);
                newServices.push({
                    name,
                    dateIn: currentDateIn.toISOString(),
                    dateOut: currentDateOut.toISOString(),
                    productId,
                    staffEmail,
                });
                auxDateIn.setDate(auxDateIn.getDate() + 7);
                auxDateOut.setDate(auxDateOut.getDate() + 7);
            }
            //console.log("New Services: ", newServices)
        }
    } else {
        if (onePerDay) {
            const auxHours = auxDateIn.getHours() + 4;

            //console.log("auxDateIn es:", auxDateIn);

            for (let a = 0; a <= repetitions; a++) {
                for (let i = 0; i <= diffDays; i++) {
                    const currentDateIn = new Date(auxDateIn);
                    const currentDateOut = new Date(currentDateIn);
                    currentDateOut.setHours(auxHours); // agrega las horas

                    newServices.push({
                        name,
                        dateIn: currentDateIn.toISOString(),
                        dateOut: currentDateOut.toISOString(),
                        productId,
                        staffEmail,
                    });

                    auxDateIn.setDate(auxDateIn.getDate() + 1); // avanzar para la próxima fecha
                }
            }
        } else {
            for (let i = 0; i <= repetitions; i++) {
                const currentDateIn = new Date(auxDateIn);
                const currentDateOut = new Date(auxDateOut);
                newServices.push({
                    name,
                    dateIn: auxDateIn.toISOString(),
                    dateOut: auxDateOut.toISOString(),
                    productId,
                    staffEmail,
                });
                auxDateIn.setDate(auxDateOut.getDate() + 1);
                auxDateOut.setDate(auxDateOut.getDate() + (diffDays + 1));
            }
            //console.log("New Services: ", newServices)
        }
    }

    return newServices;
}