import { JSX, useState } from "react";
import image1 from "../../../../public/profile/image.svg";
import vector902 from "../../../../public/profile/vector-90.svg";
import vector903 from "../../../../public/profile/vector-90.svg";
import vector90 from "../../../../public/profile/vector-90.svg";
import vector95 from "../../../../public/profile/vector-95.svg";
import vector143 from "../../../../public/profile/vector-144.svg";
import vector144 from "../../../../public/profile/vector-144.svg";
import vector145 from "../../../../public/profile/vector-145.svg";
import vector159 from "../../../../public/profile/vector-161.svg";
import vector160 from "../../../../public/profile/vector-160.svg";
import vector161 from "../../../../public/profile/vector-161.svg";
import paymentMethod from "../../../../public/profile/payment-method.svg"


interface PaymentMethod {
  id: string;
  cardImage: string;
  lastFour: string;
  expiryDate: string;
  isDefault: boolean;
  deleteIcon: string;
}

interface BillingHistoryItem {
  invoice: string;
  date: string;
  policy: string;
  amount: string;
  status: string;
  statusColor: string;
}

export const ProfileDetailsSection = (): JSX.Element => {
  const [fullName, setFullName] = useState("Lucas Bennet");
  const [phoneNumber, setPhoneNumber] = useState("+1 (555) 123-4567");
  const [emailAddress, setEmailAddress] = useState("lucaas.bennet@example.com");
  const [companyName, setCompanyName] = useState("Anderson & Co.");
  const [companyAddress, setCompanyAddress] = useState(
    "123 Business Street, New York, NY 100001",
  );

  const paymentMethods: PaymentMethod[] = [
    {
      id: "1",
      cardImage: paymentMethod,
      lastFour: "•••• 4242",
      expiryDate: "Expires 09/25",
      isDefault: true,
      deleteIcon: paymentMethod,
    },
    {
      id: "2",
      cardImage: paymentMethod,
      lastFour: "•••• 4242",
      expiryDate: "Expires 09/25",
      isDefault: true,
      deleteIcon: paymentMethod,
    },
  ];

  const billingHistory: BillingHistoryItem[] = [
    {
      invoice: "INV-001",
      date: "Nov 1, 2025",
      policy: "P-0124",
      amount: "$1,245.00",
      status: "Paid",
      statusColor: "#cbd03c",
    },
    {
      invoice: "INV-001",
      date: "Nov 1, 2025",
      policy: "P-0124",
      amount: "$1,245.00",
      status: "Paid",
      statusColor: "#cbd03c",
    },
    {
      invoice: "INV-001",
      date: "Nov 1, 2025",
      policy: "P-0124",
      amount: "$1,245.00",
      status: "Paid",
      statusColor: "#cbd03c",
    },
  ];

  const handleAddPaymentMethod = () => {
    console.log("Add payment method clicked");
  };

  const handleDeletePaymentMethod = (id: string) => {
    console.log("Delete payment method:", id);
  };

  const handleDownloadInvoice = (invoice: string) => {
    console.log("Download invoice:", invoice);
  };

  return (
    <section className="flex flex-col w-[1250px] h-[879px] items-start gap-6 p-6 absolute top-[136px] left-[438px] bg-[#fafcffcc] rounded-2xl">
      <header className="flex items-start gap-4 relative self-stretch w-full flex-[0_0_auto]">
        <img
          className="relative w-[81px] h-[81px]"
          alt="Profile picture of Lucas Bennett"
          src={paymentMethod}
        />

        <div className="flex flex-col items-start justify-between px-0 py-[5px] relative flex-1 self-stretch grow">
          <h1 className="relative self-stretch mt-[-1.00px] [font-family:'Montserrat-Regular',Helvetica] font-normal text-[#2a2a2a] text-2xl tracking-[0.48px] leading-[normal]">
            Lucas Bennett
          </h1>

          <p className="relative self-stretch [font-family:'Montserrat-Regular',Helvetica] font-normal text-[#949494] text-base tracking-[0.32px] leading-[normal]">
            Logistics Manager
          </p>

          <div className="inline-flex items-center gap-1 relative flex-[0_0_auto]">
            <img
              className="relative w-3 h-3 aspect-[1] object-cover"
              alt="Location icon"
              src={paymentMethod}
            />

            <p className="relative w-[359px] mt-[-1.00px] [font-family:'Montserrat-Regular',Helvetica] font-normal text-[#c7c7c7] text-sm tracking-[0.28px] leading-[normal]">
              Utrecht, Netherlands – 8:29 PM local time
            </p>
          </div>
        </div>
      </header>

      <div className="flex items-start justify-between relative self-stretch w-full flex-[0_0_auto]">
        <div className="flex flex-col w-[385px] items-start gap-2 relative">
          <label
            htmlFor="fullName"
            className="relative w-fit mt-[-1.00px] [font-family:'Montserrat-Regular',Helvetica] font-normal text-[#4f4f4f] text-sm tracking-[0] leading-[18px] whitespace-nowrap"
          >
            Full Name
          </label>

          <div className="flex flex-col h-[38px] items-start justify-center gap-2.5 px-3 py-2 relative self-stretch w-full rounded-[7px] border border-solid border-[#c7c7c782]">
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-transparent border-none outline-none [font-family:'Montserrat-Regular',Helvetica] font-normal text-[#7b7b7b] text-base tracking-[0] leading-[18px]"
              aria-label="Full Name"
            />
          </div>
        </div>

        <div className="flex flex-col w-[385px] items-start gap-2 relative">
          <label
            htmlFor="phoneNumber"
            className="relative w-fit mt-[-1.00px] [font-family:'Montserrat-Regular',Helvetica] font-normal text-[#4f4f4f] text-sm tracking-[0] leading-[18px] whitespace-nowrap"
          >
            Phone Number
          </label>

          <div className="flex flex-col h-[38px] items-start justify-center gap-2.5 px-3 py-2 relative self-stretch w-full rounded-[7px] border border-solid border-[#c7c7c782]">
            <input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full bg-transparent border-none outline-none [font-family:'Montserrat-Regular',Helvetica] font-normal text-[#7b7b7b] text-base tracking-[0] leading-[18px]"
              aria-label="Phone Number"
            />
          </div>
        </div>

        <div className="flex flex-col w-[385px] items-start gap-2 relative">
          <label
            htmlFor="emailAddress"
            className="relative w-fit mt-[-1.00px] [font-family:'Montserrat-Regular',Helvetica] font-normal text-[#4f4f4f] text-sm tracking-[0] leading-[18px] whitespace-nowrap"
          >
            Email Address
          </label>

          <div className="flex flex-col h-[38px] items-start justify-center gap-2.5 px-3 py-2 relative self-stretch w-full rounded-[7px] border border-solid border-[#c7c7c782]">
            <input
              id="emailAddress"
              type="email"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              className="w-full bg-transparent border-none outline-none [font-family:'Montserrat-Regular',Helvetica] font-normal text-[#7b7b7b] text-base tracking-[0] leading-[18px]"
              aria-label="Email Address"
            />
          </div>
        </div>
      </div>

      <img
        className="relative self-stretch w-full h-px object-cover"
        alt=""
        src={vector159}
        role="presentation"
      />

      <div className="inline-flex flex-col items-start gap-5 relative flex-[0_0_auto]">
        <div className="relative w-[272px] h-[43px]">
          <h2 className="absolute top-0 left-0 [font-family:'Montserrat-Medium',Helvetica] font-medium text-black text-lg tracking-[0.36px] leading-[normal]">
            Company Information
          </h2>

          <p className="absolute top-7 left-0 [font-family:'Montserrat-Regular',Helvetica] font-normal text-[#c7c7c7] text-xs tracking-[0.24px] leading-[normal]">
            Details used for policy and billing purposes
          </p>
        </div>

        <div className="inline-flex items-start gap-6 relative flex-[0_0_auto]">
          <div className="flex flex-col w-[385px] items-start gap-2 relative">
            <label
              htmlFor="companyName"
              className="relative w-fit mt-[-1.00px] [font-family:'Montserrat-Regular',Helvetica] font-normal text-[#4f4f4f] text-sm tracking-[0] leading-[18px] whitespace-nowrap"
            >
              Company Name
            </label>

            <div className="flex flex-col h-[38px] items-start justify-center gap-2.5 px-3 py-2 relative self-stretch w-full rounded-[7px] border border-solid border-[#c7c7c782]">
              <input
                id="companyName"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-transparent border-none outline-none [font-family:'Montserrat-Regular',Helvetica] font-normal text-[#7b7b7b] text-base tracking-[0] leading-[18px]"
                aria-label="Company Name"
              />
            </div>
          </div>

          <div className="flex flex-col w-[385px] items-start gap-2 relative">
            <label
              htmlFor="companyAddress"
              className="relative w-fit mt-[-1.00px] [font-family:'Montserrat-Regular',Helvetica] font-normal text-[#4f4f4f] text-sm tracking-[0] leading-[18px] whitespace-nowrap"
            >
              Company Address
            </label>

            <div className="flex flex-col h-[38px] items-start justify-center gap-2.5 px-3 py-2 relative self-stretch w-full rounded-[7px] border border-solid border-[#c7c7c782]">
              <input
                id="companyAddress"
                type="text"
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                className="w-full bg-transparent border-none outline-none [font-family:'Montserrat-Regular',Helvetica] font-normal text-[#7b7b7b] text-base tracking-[0] leading-[18px]"
                aria-label="Company Address"
              />
            </div>
          </div>
        </div>
      </div>

      <img
        className="relative self-stretch w-full h-px object-cover"
        alt=""
        src={vector160}
        role="presentation"
      />

      <div className="inline-flex flex-col items-start gap-5 relative flex-[0_0_auto]">
        <div className="flex items-start justify-between relative self-stretch w-full flex-[0_0_auto]">
          <div className="w-[278px] relative h-[43px]">
            <h2 className="absolute top-0 left-0 [font-family:'Montserrat-Medium',Helvetica] font-medium text-black text-lg tracking-[0.36px] leading-[normal]">
              Payment Methods
            </h2>

            <p className="absolute top-7 left-0 [font-family:'Montserrat-Regular',Helvetica] font-normal text-[#c7c7c7] text-xs tracking-[0.24px] leading-[normal]">
              Add or remove payment methods for billing
            </p>
          </div>

          <button
            onClick={handleAddPaymentMethod}
            className="inline-flex h-[35.68px] items-center justify-center gap-2.5 px-3 py-1.5 relative flex-[0_0_auto] bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            aria-label="Add Payment Method"
          >
            <span className="relative w-fit [font-family:'Poppins-Regular',Helvetica] font-normal text-white text-sm tracking-[0] leading-[18px] whitespace-nowrap">
              Add Payment Method
            </span>
          </button>
        </div>

        <div className="inline-flex items-start gap-6 relative flex-[0_0_auto]">
          {paymentMethods.map((method) => (
            <article
              key={method.id}
              className="flex w-[385px] items-center justify-between p-3 relative rounded-[9px] border border-dashed border-[#e7e7eb]"
            >
              <div className="flex flex-col items-start gap-4 relative flex-1 grow">
                <div className="flex flex-col w-[172px] items-start gap-1.5 relative flex-[0_0_auto]">
                  <div className="inline-flex items-center gap-3 relative flex-[0_0_auto]">
                    <div className="flex flex-col w-[58px] h-[39px] items-start gap-2.5 relative">
                      <img
                        className="relative flex-1 self-stretch w-full grow"
                        alt="Payment card logo"
                        src={method.cardImage}
                      />
                    </div>

                    <div className="flex flex-col w-[102px] items-start justify-center relative">
                      <div className="relative w-[99px] h-[17px]">
                        <div className="absolute top-0 left-0 w-[211px] [font-family:'Urbanist-Medium',Helvetica] font-medium text-[#5e5e5e] text-sm tracking-[0] leading-[normal]">
                          {method.lastFour}
                        </div>

                        {method.isDefault && (
                          <div className="inline-flex items-center justify-center gap-2.5 px-1 py-px absolute top-[calc(50.00%_-_6px)] left-[58px] bg-[#edecf7] rounded-[3px]">
                            <span className="relative w-fit mt-[-1.00px] [font-family:'Urbanist-Medium',Helvetica] font-medium text-[#7b7b7b] text-[8px] tracking-[0] leading-[normal]">
                              Default
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="relative w-[88px] [font-family:'Urbanist-Medium',Helvetica] font-medium text-[#7b7b7b] text-[10px] tracking-[0] leading-[normal]">
                        {method.expiryDate}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleDeletePaymentMethod(method.id)}
                className="relative w-5 h-5 aspect-[1] hover:opacity-70 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded transition-opacity"
                aria-label="Delete payment method"
              >
                <img
                  className="w-full h-full object-cover"
                  alt=""
                  src={method.deleteIcon}
                />
              </button>
            </article>
          ))}
        </div>
      </div>

      <img
        className="relative self-stretch w-full h-px object-cover"
        alt=""
        src={vector161}
        role="presentation"
      />

      <div className="w-[354px] relative h-[43px]">
        <h2 className="absolute top-0 left-0 [font-family:'Montserrat-Medium',Helvetica] font-medium text-black text-lg tracking-[0.36px] leading-[normal]">
          Billing History
        </h2>

        <p className="absolute top-7 left-0 [font-family:'Montserrat-Regular',Helvetica] font-normal text-[#c7c7c7] text-xs tracking-[0.24px] leading-[normal]">
          View your policy premium payment history and invoices
        </p>
      </div>

      <div className="relative w-[1186px] h-[18px]" role="row">
        <div className="inline-flex items-center gap-1.5 absolute top-0 left-0">
          <div className="relative w-fit mt-[-1.00px] [font-family:'Poppins-Regular',Helvetica] font-normal text-[#606068] text-sm tracking-[0] leading-[18px] whitespace-nowrap">
            Invoice
          </div>
        </div>

        <div className="inline-flex items-center gap-2 absolute top-0 left-[209px]">
          <img
            className="relative w-px h-[10.5px] ml-[-0.50px]"
            alt=""
            src={vector90}
            role="presentation"
          />

          <div className="inline-flex items-center gap-[7px] relative flex-[0_0_auto]">
            <div className="relative w-fit mt-[-1.00px] [font-family:'Poppins-Regular',Helvetica] font-normal text-[#606068] text-sm tracking-[0] leading-[18px] whitespace-nowrap">
              Date
            </div>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 absolute top-0 left-[436px]">
          <img
            className="relative w-px h-[10.5px] ml-[-0.50px]"
            alt=""
            src={image1}
            role="presentation"
          />

          <div className="inline-flex items-center gap-[7px] relative flex-[0_0_auto]">
            <div className="relative w-fit mt-[-1.00px] [font-family:'Poppins-Regular',Helvetica] font-normal text-[#606068] text-sm tracking-[0] leading-[18px] whitespace-nowrap">
              Policy
            </div>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 absolute top-0 left-[641px]">
          <img
            className="relative w-px h-[10.5px] ml-[-0.50px]"
            alt=""
            src={vector902}
            role="presentation"
          />

          <div className="inline-flex items-center gap-[7px] relative flex-[0_0_auto]">
            <div className="relative w-fit mt-[-1.00px] [font-family:'Poppins-Regular',Helvetica] font-normal text-[#606068] text-sm tracking-[0] leading-[18px] whitespace-nowrap">
              Amount
            </div>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 absolute top-0 left-[855px]">
          <img
            className="relative w-px h-[10.5px] ml-[-0.50px]"
            alt=""
            src={vector903}
            role="presentation"
          />

          <div className="inline-flex items-center gap-[7px] relative flex-[0_0_auto]">
            <div className="relative w-fit mt-[-1.00px] [font-family:'Poppins-Regular',Helvetica] font-normal text-[#606068] text-sm tracking-[0] leading-[18px] whitespace-nowrap">
              Status
            </div>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 absolute top-0 left-[1133px]">
          <img
            className="relative w-px h-[10.5px] ml-[-0.50px]"
            alt=""
            src={vector95}
            role="presentation"
          />

          <div className="relative w-fit mt-[-1.00px] [font-family:'Poppins-Regular',Helvetica] font-normal text-[#606068] text-sm tracking-[0] leading-[18px] whitespace-nowrap">
            Action
          </div>
        </div>
      </div>

      <div className="flex flex-col w-[1193px] items-start gap-2 relative flex-[0_0_auto] mb-[-16.00px]">
        <img
          className="relative w-[1193.5px] h-px mt-[-0.50px] mr-[-0.50px] object-cover"
          alt=""
          src={vector143}
          role="presentation"
        />

        {billingHistory.map((item, index) => (
          <div key={index}>
            <article className="relative w-[1193px] h-11 bg-[#f8fafd] rounded-md">
              <div className="flex w-[1173px] items-center justify-between relative top-1 left-3 bg-[#f8fafd]">
                <div className="relative w-fit [font-family:'Poppins-Regular',Helvetica] font-normal text-black text-sm tracking-[0] leading-[18px] whitespace-nowrap">
                  {item.invoice}
                </div>

                <time className="relative w-fit [font-family:'Poppins-Regular',Helvetica] font-normal text-black text-sm tracking-[0] leading-[18px] whitespace-nowrap">
                  {item.date}
                </time>

                <a
                  href={`#${item.policy}`}
                  className="relative w-[53px] h-[21px] [font-family:'Poppins-Regular',Helvetica] font-normal text-blue-600 text-sm tracking-[0] leading-[18px] underline whitespace-nowrap hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                >
                  {item.policy}
                </a>

                <div className="relative w-fit [font-family:'Poppins-Regular',Helvetica] font-normal text-[#030303] text-sm tracking-[0] leading-[18px] whitespace-nowrap">
                  {item.amount}
                </div>

                <div className="inline-flex items-center justify-center gap-1.5 px-0 py-0.5 relative flex-[0_0_auto] rounded-[37px]">
                  <div
                    className="relative w-1.5 h-1.5 rounded-[3px]"
                    style={{ backgroundColor: item.statusColor }}
                  />

                  <div
                    className="relative w-fit mt-[-1.00px] [font-family:'Poppins-Regular',Helvetica] font-normal text-xs tracking-[0] leading-[18px] whitespace-nowrap"
                    style={{ color: item.statusColor }}
                  >
                    {item.status}
                  </div>
                </div>

                <div className="inline-flex items-center gap-4 relative flex-[0_0_auto]">
                  <button
                    onClick={() => handleDownloadInvoice(item.invoice)}
                    className="flex w-[130px] h-[35.68px] items-center justify-center gap-2.5 px-3 py-1.5 relative rounded-md border border-solid border-[#e3e6ea] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                    aria-label={`Download invoice ${item.invoice}`}
                  >
                    <span className="relative w-fit [font-family:'Poppins-Regular',Helvetica] font-normal text-gray-700 text-sm tracking-[0] leading-[18px] whitespace-nowrap">
                      Download
                    </span>
                  </button>
                </div>
              </div>
            </article>

            <img
              className="relative w-[1193.5px] h-px mr-[-0.50px] object-cover"
              alt=""
              src={
                index === 0 ? vector144 : index === 1 ? vector145 : vector145
              }
              role="presentation"
            />
          </div>
        ))}
      </div>
    </section>
  );
};