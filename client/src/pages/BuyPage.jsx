import { useParams } from "react-router-dom";

const BuyPage = () => {
  const { courseId } = useParams();

  return (
    <div className="text-white p-10">
      <h1 className="text-2xl font-bold">💳 Buy Page for Course ID: {courseId}</h1>
      <p className="mt-4 text-gray-300">This is a dummy payment page. Integration coming soon!</p>
    </div>
  );
};

export default BuyPage;
