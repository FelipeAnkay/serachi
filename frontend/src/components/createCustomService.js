
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
                auxDateIn.setDate(auxWeekDateIn.getDate() + (a * 7));
                for (let i = 0; i <= diffDays; i++) {
                    auxDateOut.setDate(auxDateIn.getDate());
                    auxDateOut.setHours(auxHours);
                    newServices.push({
                        name,
                        dateIn: auxDateIn.toISOString(),
                        dateOut: auxDateOut.toISOString(),
                        productId,
                        staffEmail,
                    });
                    auxDateIn.setDate(auxDateIn.getDate() + 1);
                }
            }
        } else {
            for (let i = 0; i <= repetitions; i++) {
                newServices.push({
                    name,
                    dateIn: auxDateIn.toISOString(),
                    dateOut: auxDateOut.toISOString(),
                    productId,
                    staffEmail,
                });
                auxDateIn.setDate(auxDateIn.getDate() + 7);
                auxDateOut.setDate(auxDateOut.getDate() + 7);
            }
        }
    } else {
        if (onePerDay) {
            const auxHours = auxDateIn.getHours() + 4;
            for (let a = 0; a <= repetitions; a++) {
                for (let i = 0; i <= diffDays; i++) {
                    auxDateOut.setDate(auxDateIn.getDate());
                    auxDateOut.setHours(auxHours);
                    newServices.push({
                        name,
                        dateIn: auxDateIn.toISOString(),
                        dateOut: auxDateOut.toISOString(),
                        productId,
                        staffEmail,
                    });
                    auxDateIn.setDate(auxDateIn.getDate() + 1);
                }
            }
        } else {
            for (let i = 0; i <= repetitions; i++) {
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
        }
    }

    return newServices;
}